import assert from "node:assert/strict";
import { LoadTestOptions } from "./LoadTestOptions.js";
import { LoadTestServerProcess } from "./LoadTestServerProcess.js";
import { VirtualUserLoadRunner } from "./VirtualUserLoadRunner.js";

const options = new LoadTestOptions();
for (const args of [["--url", "https://example.com"], ["--users", "0"], ["--users", "5001"], ["--concurrency", "101"], ["--sessions", "0"]]) assert.throws(() => options.parseArguments(args));
const process = new LoadTestServerProcess();
try {
  const server = await process.start(120);
  const result = await new VirtualUserLoadRunner().runSessions(server, { concurrency: 4, sessions: 8, thinkMs: 0 });
  assert.equal(result.healthAfterLoad, 200);
  for (const route of Object.values(result.routes)) { assert.equal(route.errors, 0); assert.equal(route.successful, 8); }
  const sample = await process.readSample(); assert.equal(sample.reportBuilds, 1);
  const getPage = async (suffix, index = 0) => {
    const response = await fetch(`${server.origin}/api/standings?month=${encodeURIComponent(server.month)}${suffix}`, { headers: { "x-web-login": server.tokens[index] } });
    assert.equal(response.status, 200); return (await response.json()).standings;
  };
  const first = await getPage("&limit=50"); const second = await getPage(`&limit=50&offset=50&version=${first.version}`);
  assert.equal(first.entries.length, 50); assert.equal(second.entries.length, 50);
  assert.equal(new Set([...first.entries, ...second.entries].map((entry) => entry.userId)).size, 100);
  const another = await getPage("&summary=1", 1);
  assert.equal(another.currentUser.userId, "2"); assert.equal(first.currentUser.userId, "1");
} finally { await process.stop(); }
console.log("Performance isolated HTTP load and shared report self-test passed");
