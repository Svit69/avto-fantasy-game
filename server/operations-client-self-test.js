import assert from "node:assert/strict";
import { CapacityAwareApiRequest } from "../src/services/CapacityAwareApiRequest.js";
import { RosterSubmissionFlow } from "../src/services/RosterSubmissionFlow.js";

let calls = 0; const waits = [];
const client = new CapacityAwareApiRequest(async () => { calls += 1; return new Response("{}", { status: calls < 3 ? 503 : 200, headers: { "Retry-After": "1" } }); }, async (milliseconds) => waits.push(milliseconds));
assert.equal((await client.fetchResponse("/api/players")).status, 200);
assert.equal(calls, 3); assert.equal(waits.length, 2);
calls = 0; assert.equal((await client.fetchResponse("/api/roster", { method: "POST" })).status, 503);
assert.equal(calls, 1, "Never replay roster writes automatically");
let networkCalls = 0;
await assert.rejects(new CapacityAwareApiRequest(async () => { networkCalls += 1; throw new Error("offline"); }).fetchResponse("/api/players"), /offline/);
assert.equal(networkCalls, 1, "Do not reinterpret network instability as server overload");
const oldWindow = globalThis.window; const alerts = [];
globalThis.window = { alert: (text) => alerts.push(text) };
try {
  const button = { disabled: false }; const selection = ["player-1", "player-2"];
  await new RosterSubmissionFlow().submitRoster(button, async () => { throw { statusCode: 503, retryAfter: 5 }; });
  assert.equal(button.disabled, false); assert.deepEqual(selection, ["player-1", "player-2"]);
  assert(alerts[0].includes("остались на экране"));
} finally { if (oldWindow === undefined) delete globalThis.window; else globalThis.window = oldWindow; }
console.log("Operations client retry and roster preservation self-test passed");
