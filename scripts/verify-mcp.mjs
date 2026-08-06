#!/usr/bin/env node
// Walks the exact discovery chain an MCP client performs against the URL in
// plugins/caffeine/mcp.json. Stops before completing any sign-in.

import { promises as fs } from "node:fs";
import crypto from "node:crypto";

const cfg = JSON.parse(await fs.readFile("plugins/caffeine/mcp.json", "utf8"));
const server = cfg.mcpServers.caffeine;
const URL_ = server.url;

let failed = false;
const step = (n, msg) => console.log(`\n[${n}] ${msg}`);
const ok = (m) => console.log(`   PASS  ${m}`);
const bad = (m) => { failed = true; console.log(`   FAIL  ${m}`); };

console.log(`config: type=${server.type} url=${URL_}`);
if (server.type !== "http") bad(`expected type "http", got "${server.type}"`);

// 1 — unauthenticated initialize must 401 and advertise its resource metadata
step(1, "POST initialize without credentials");
const init = await fetch(URL_, {
  method: "POST",
  headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
  body: JSON.stringify({
    jsonrpc: "2.0", id: 1, method: "initialize",
    params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "verify", version: "1" } },
  }),
});
init.status === 401 ? ok("401 as expected (route matched, auth enforced)") : bad(`expected 401, got ${init.status}`);

const wwwAuth = init.headers.get("www-authenticate") ?? "";
const rmMatch = wwwAuth.match(/resource_metadata="([^"]+)"/);
rmMatch ? ok(`WWW-Authenticate advertises resource_metadata`) : bad(`no resource_metadata in WWW-Authenticate: ${wwwAuth}`);

// 2 — protected-resource metadata (RFC 9728)
step(2, "GET protected-resource metadata");
const prm = await (await fetch(rmMatch[1])).json();
prm.resource ? ok(`resource: ${prm.resource}`) : bad("no resource field");
const authServer = prm.authorization_servers?.[0];
authServer ? ok(`authorization server: ${authServer}`) : bad("no authorization_servers");

// 3 — authorization server metadata (RFC 8414)
step(3, "GET authorization-server metadata");
const asUrl = new URL("/.well-known/oauth-authorization-server", authServer).href;
const meta = await (await fetch(asUrl)).json();
for (const k of ["authorization_endpoint", "token_endpoint", "registration_endpoint"]) {
  meta[k] ? ok(`${k}: ${meta[k]}`) : bad(`missing ${k}`);
}
meta.code_challenge_methods_supported?.includes("S256")
  ? ok("PKCE S256 supported")
  : bad("PKCE S256 not advertised");

// 4/5 — registration and authorization, using the exact redirect URIs Cursor
// uses. Cursor does not let a server pick these, so a server that rejected
// either one would break the plugin even though a generic OAuth probe passed.
const CURSOR_REDIRECT_URIS = [
  ["desktop", "http://localhost:8787/callback"],
  ["web", "https://www.cursor.com/agents/mcp/oauth/callback"],
];

for (const [surface, redirectUri] of CURSOR_REDIRECT_URIS) {
  step(`4/${surface}`, `Dynamic client registration for Cursor ${surface} (${redirectUri})`);
  const reg = await fetch(meta.registration_endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      client_name: "caffeine-cursor-plugin verification",
      redirect_uris: [redirectUri],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
    }),
  });
  const client = await reg.json();
  if (!client.client_id) {
    bad(`registration rejected this redirect_uri: ${JSON.stringify(client)}`);
    continue;
  }
  ok("registered, client_id issued");

  step(`5/${surface}`, "GET authorize with PKCE challenge (not completing sign-in)");
  const verifier = crypto.randomBytes(32).toString("base64url");
  const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");
  const authUrl = new URL(meta.authorization_endpoint);
  authUrl.search = new URLSearchParams({
    response_type: "code",
    client_id: client.client_id,
    redirect_uri: redirectUri,
    code_challenge: challenge,
    code_challenge_method: "S256",
    scope: (prm.scopes_supported ?? ["caffeine"]).join(" "),
    state: crypto.randomBytes(8).toString("hex"),
  }).toString();

  const authRes = await fetch(authUrl, { redirect: "manual" });
  if (![200, 302, 303].includes(authRes.status)) {
    bad(`authorize returned ${authRes.status}`);
    continue;
  }
  ok(`authorize responded ${authRes.status}`);

  // The sign-in page the user actually lands on must render.
  const location = authRes.headers.get("location");
  if (location) {
    const page = await fetch(new URL(location, authUrl), { redirect: "manual" });
    page.ok
      ? ok(`sign-in page renders (${page.status}, ${page.headers.get("content-type")?.split(";")[0]})`)
      : bad(`sign-in page returned ${page.status}`);
  }
}

console.log(failed ? "\nRESULT: FAILED\n" : "\nRESULT: all checks passed — Cursor can complete this flow in a browser.\n");
process.exit(failed ? 1 : 0);
