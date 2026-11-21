// Wanderworld's server part calling an Engine that serves HTTPS (review L-11): the call goes to 127.0.0.1
// and nowhere else, names the Engine as the browser reached it (the request's Host), and the Engine's
// certificate is checked against that name.
// Run: node tests/wanderworld-loopback.regression.mjs
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createServer } from "node:https";
import { tmpdir } from "node:os";
import { join } from "node:path";
import tls from "node:tls";

const server = await import("../packages/wanderworld/server.mjs");

// ── The name in a Host header ──
assert.equal(server.hostNameOf("Wanderworld.Test:7860"), "wanderworld.test");
assert.equal(server.hostNameOf("localhost"), "localhost");
assert.equal(server.hostNameOf("192.168.1.5:7860"), "192.168.1.5");
assert.equal(server.hostNameOf("[::1]:7860"), "::1");
for (const bad of ["", " ", "a b", "x/y", "evil.test@127.0.0.1", "[nope]:1", "-x.test", "x.test:", null, 5]) {
  assert.equal(server.hostNameOf(bad), null, `${JSON.stringify(bad)} is not a host name`);
}

// ── A real HTTPS Engine on 127.0.0.1, with a certificate for a name that resolves nowhere ──
const folder = mkdtempSync(join(tmpdir(), "wanderworld-tls-"));
let pems = null;
try {
  execFileSync(
    "openssl",
    [
      "req",
      "-x509",
      "-newkey",
      "rsa:2048",
      "-nodes",
      "-days",
      "2",
      "-subj",
      "/CN=wanderworld.test",
      "-addext",
      "subjectAltName=DNS:wanderworld.test",
      "-keyout",
      join(folder, "key.pem"),
      "-out",
      join(folder, "cert.pem"),
    ],
    { stdio: "ignore" },
  );
  pems = { key: readFileSync(join(folder, "key.pem")), cert: readFileSync(join(folder, "cert.pem")) };
} catch {
  // (no openssl here)
}
rmSync(folder, { recursive: true, force: true });

if (!pems || typeof tls.setDefaultCACertificates !== "function") {
  console.log("wanderworld-loopback: name checks passed; the HTTPS part skipped (it needs openssl and Node 22.19+)");
} else {
  // Node trusts the test certificate the way NODE_EXTRA_CA_CERTS would make it trust a user's own.
  tls.setDefaultCACertificates([...tls.getCACertificates("default"), pems.cert.toString()]);
  const seen = [];
  const engine = createServer(pems, (request, response) => {
    let body = "";
    request.on("data", (chunk) => (body += chunk));
    request.on("end", () => {
      seen.push({ host: request.headers.host, servername: request.socket.servername, method: request.method, body });
      response.setHeader("content-type", "application/json");
      if (request.url === "/api/connections") {
        response.end(JSON.stringify([{ id: "t-1", name: "Claude", provider: "anthropic", model: "x" }]));
      } else if (request.url === "/api/missing") {
        response.statusCode = 404;
        response.end(JSON.stringify({ error: "Not here" }));
      } else response.end(JSON.stringify({ echoed: body }));
    });
  });
  await new Promise((resolve) => engine.listen(0, "127.0.0.1", resolve));
  const port = String(engine.address().port);
  const env = { PORT: port, SSL_CERT: "cert.pem", SSL_KEY: "key.pem" };

  // By the certificate's name: it reaches 127.0.0.1 (the name resolves nowhere) and the check passes.
  const rows = await server.engineFetch("/api/connections", { method: "GET" }, { env, name: "wanderworld.test" });
  assert.equal(rows[0].id, "t-1");
  assert.deepEqual(seen.at(-1), {
    host: `wanderworld.test:${port}`,
    servername: "wanderworld.test",
    method: "GET",
    body: "",
  });
  const posted = await server.engineFetch(
    "/api/scene/create",
    { method: "POST", headers: { "Content-Type": "application/json" }, body: '{"a":1}' },
    { env, name: "wanderworld.test" },
  );
  assert.equal(posted.echoed, '{"a":1}', "a POST body goes through");
  await assert.rejects(
    server.engineFetch("/api/missing", {}, { env, name: "wanderworld.test" }),
    /The Engine answered 404: Not here/u,
  );

  // By a name the certificate isn't for, or by 127.0.0.1: the certificate check fails, nothing is read.
  const count = seen.length;
  await assert.rejects(server.engineFetch("/api/connections", {}, { env, name: "other.test" }), (error) =>
    /other\.test|altnames/iu.test(error.message),
  );
  await assert.rejects(server.engineFetch("/api/connections", {}, { env, name: null }));
  assert.equal(seen.length, count, "a refused certificate sends no request");

  // Through the routes: the Host of the request names the Engine.
  const routes = new Map();
  const saved = { PORT: process.env.PORT, SSL_CERT: process.env.SSL_CERT, SSL_KEY: process.env.SSL_KEY };
  Object.assign(process.env, env);
  const stop = await server.activate({
    api: {
      runtime: {
        persistence: { documents: {} },
        resources: {},
        languageModels: {},
        logger: { warn() {}, info() {}, debug() {} },
      },
      async registerPrivilegedRoutes(register) {
        await register({
          get: (path, handler) => routes.set(`GET ${path}`, handler),
          post: (path, handler) => routes.set(`POST ${path}`, handler),
          delete: (path, handler) => routes.set(`DELETE ${path}`, handler),
        });
        return () => {};
      },
    },
  });
  const reply = { status: () => reply, send: (body) => body };
  const listed = await routes.get("GET /connections")({ headers: { host: `wanderworld.test:${port}` } }, reply);
  assert.deepEqual(
    listed.text.map((row) => row.id),
    ["t-1"],
  );
  assert.equal(seen.at(-1).servername, "wanderworld.test");
  for (const [key, value] of Object.entries(saved)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  await stop?.();
  engine.close();
  console.log("wanderworld-loopback: all checks passed");
}
