import assert from "node:assert/strict";
import http from "node:http";
import { once } from "node:events";
import { ProtectedHttpApplication } from "./ProtectedHttpApplication.js";
import { ApiWorkMetrics } from "./ApiWorkMetrics.js";

let active = 0; let maximum = 0;
const operations = { metrics: new ApiWorkMetrics(), handleEndpoint: async (_request, response) => { response.writeHead(200); response.end("ready"); } };
const application = new ProtectedHttpApplication({ handleRequest: async (request, response) => {
  if (request.url === "/api/health") { response.end("healthy"); return; }
  active += 1; maximum = Math.max(maximum, active);
  await new Promise((resolve) => setTimeout(resolve, request.url === "/api/slow-fixture" ? 2100 : 20)); active -= 1;
  response.writeHead(200); response.end("ok");
} }, { operations });
const server = http.createServer((request, response) => application.handleRequest(request, response));
server.listen(0, "127.0.0.1"); await once(server, "listening");
try {
  const origin = `http://127.0.0.1:${server.address().port}`;
  const responses = await Promise.all(Array.from({ length: 60 }, async () => {
    const response = await fetch(`${origin}/api/players`); await response.text(); return response;
  }));
  assert(responses.every((response) => [200, 503].includes(response.status)));
  assert(maximum <= 8 && maximum > 0);
  assert.equal((await fetch(`${origin}/api/health`)).status, 200);
  assert.equal((await fetch(`${origin}/api/ready`)).status, 200);
  assert.equal((await fetch(`${origin}/api/slow-fixture`)).status, 200, "Server work longer than two seconds must not be rejected");
  assert.equal(application.admission.readStatus().read, 0);
} finally { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); }
console.log("Operations HTTP burst self-test passed");
