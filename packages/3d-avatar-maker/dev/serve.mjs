// A test page for 3D Avatar Maker outside the Engine: bundles src/ afresh on each load and serves the kit
// from this package's folder, with a few made-up characters and personas in place of the Engine's lists.
//
//   node packages/3d-avatar-maker/dev/serve.mjs [port]     (default 5197)
//
// Installed wardrobe packs are stood in for by the repo's packages/3d-avatar-maker-*/ folders (or those in
// the folder AVATAR_PACKS names): each is listed as active, and its declared assets are served.
//
// It is for development only and is not part of the package the Engine installs.
import { createServer } from "node:http";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(packageRoot, "../..");
const port = Number(process.argv[2] ?? process.env.PORT ?? 5197);
const packsRoot = resolve(process.env.AVATAR_PACKS ?? join(repoRoot, "packages"));

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".webp": "image/webp",
  ".glb": "model/gltf-binary",
  ".vrm": "model/gltf-binary",
};
const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>3D Avatar Maker (test page)</title>
<style>html, body { margin: 0; height: 100%; } #host { position: fixed; inset: 0; }</style>
</head>
<body>
<div id="host"></div>
<script src="/client.js"></script>
<script>
  const element = document.createElement("marinara-capability-3d-avatar-maker");
  element.setAttribute("view", "browser");
  element.capabilityProps = { packageId: "3d-avatar-maker", packageVersion: "", kitBase: "/kit/" };
  document.getElementById("host").append(element);
  window.maker = element;
</script>
</body>
</html>`;
const VIEWER = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Saved avatar, as the Engine loads it (check page)</title>
<style>html, body { margin: 0; height: 100%; background: #2a2e37; color: #e8eaf0; font: 14px system-ui; }
canvas { position: fixed; inset: 0; width: 100%; height: 100%; } #said { position: fixed; left: 10px; top: 10px; white-space: pre-wrap; }</style>
</head>
<body><canvas id="view"></canvas><div id="said">Loading…</div><script src="/viewer.js"></script></body>
</html>`;
const MOCK = {
  "/api/characters/personas/list": [{ id: "p1", name: "Mira (persona)" }],
  "/api/characters": [
    { id: "c1", data: JSON.stringify({ name: "Captain Aldric" }) },
    { id: "c2", data: { data: { name: "Sister Wren" } } },
  ],
};

/** The wardrobe packs, as the Engine lists installed packages: [{ id, version, status, readiness, manifest }]. */
async function installedPacks() {
  const names = (await readdir(packsRoot).catch(() => [])).filter((name) => /^3d-avatar-maker-[a-z0-9-]+$/u.test(name));
  const packs = [];
  for (const name of names) {
    try {
      const manifest = JSON.parse(await readFile(join(packsRoot, name, "manifest.json"), "utf8"));
      if (manifest.id === name)
        packs.push({ id: name, version: manifest.version, status: "active", readiness: "ready", manifest });
    } catch {
      // (A folder without a readable manifest isn't a pack.)
    }
  }
  return packs;
}

/** A pack's asset file, as the Engine serves one: only a path its manifest declares, inside its folder. */
async function packAsset(id, path) {
  const pack = (await installedPacks()).find((each) => each.id === id);
  if (!pack?.manifest.contributions?.assets?.paths?.includes(path)) return null;
  const folder = join(packsRoot, id);
  const file = normalize(join(folder, path));
  return file.startsWith(folder + sep) ? file : null;
}

async function bundle(entry = "packages/3d-avatar-maker/src/main.js") {
  const result = await build({
    absWorkingDir: repoRoot,
    entryPoints: [entry],
    bundle: true,
    format: "iife",
    platform: "browser",
    target: "es2022",
    sourcemap: "inline",
    write: false,
    logLevel: "silent",
  });
  return result.outputFiles[0].contents;
}

createServer(async (request, response) => {
  const path = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const send = (status, type, body) => {
    response.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
    response.end(body);
  };
  try {
    if (path === "/" || path === "/index.html") return send(200, TYPES[".html"], PAGE);
    if (path === "/client.js") return send(200, TYPES[".js"], await bundle());
    // The check page: a saved .glb loaded the way the Engine loads a "GLB or FBX model" (dev/viewer.js).
    if (path === "/viewer") return send(200, TYPES[".html"], VIEWER);
    // The pictures page: makes the icon, cover and banner from the kit's own avatars (dev/art.js).
    if (path === "/art") {
      const page = VIEWER.replace("/viewer.js", "/art.js").replace("position: fixed; inset: 0;", "display: none;");
      return send(200, TYPES[".html"], page);
    }
    if (path === "/art.js") return send(200, TYPES[".js"], await bundle("packages/3d-avatar-maker/dev/art.js"));
    if (path === "/viewer.js") return send(200, TYPES[".js"], await bundle("packages/3d-avatar-maker/dev/viewer.js"));
    // The test page can hand a saved file to the check page: POST /dev/out/<name> keeps it in dev/out/.
    if (path.startsWith("/dev/out/")) {
      const file = normalize(join(packageRoot, path));
      if (!file.startsWith(join(packageRoot, "dev", "out") + sep)) return send(403, "text/plain", "Forbidden");
      if (request.method === "POST") {
        const chunks = [];
        for await (const chunk of request) chunks.push(chunk);
        await mkdir(dirname(file), { recursive: true });
        await writeFile(file, Buffer.concat(chunks));
        return send(200, "text/plain", "kept");
      }
      return send(200, TYPES[extname(file)] ?? "application/octet-stream", await readFile(file));
    }
    if (Object.hasOwn(MOCK, path)) return send(200, TYPES[".json"], JSON.stringify(MOCK[path]));
    if (path === "/api/capability-packages/installed")
      return send(200, TYPES[".json"], JSON.stringify(await installedPacks()));
    const asset = /^\/api\/capability-packages\/([a-z0-9-]+)\/assets\/(.+)$/u.exec(path);
    if (asset) {
      const file = await packAsset(asset[1], asset[2]);
      if (!file) return send(404, "text/plain", "Not found");
      return send(200, TYPES[extname(file)] ?? "application/octet-stream", await readFile(file));
    }
    if (path.startsWith("/kit/")) {
      const file = normalize(join(packageRoot, path));
      if (!file.startsWith(join(packageRoot, "kit") + sep)) return send(403, "text/plain", "Forbidden");
      return send(200, TYPES[extname(file)] ?? "application/octet-stream", await readFile(file));
    }
    return send(404, "text/plain", "Not found");
  } catch (error) {
    console.error(error);
    return send(500, "text/plain", String(error?.message ?? error));
  }
}).listen(port, "127.0.0.1", () => console.log(`3D Avatar Maker test page: http://127.0.0.1:${port}/`));
