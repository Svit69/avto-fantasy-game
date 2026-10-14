import assert from "node:assert/strict";
import { ExternalAvailabilityProbe } from "./ExternalAvailabilityProbe.js";

let state = null; let available = false; let now = 0; const messages = [];
const probe = new ExternalAvailabilityProbe({ url: "https://example.test/api/ready", clock: () => now,
  store: { readState: async () => state, writeState: async (_name, value) => { state = structuredClone(value); } },
  logger: { warn: () => {} }, adminIds: ["1"],
  botClient: { hasToken: () => true, callJson: async (_method, payload) => { messages.push(payload); return { ok: true }; } },
  fetcher: async () => new Response(JSON.stringify({ ok: available }), { status: available ? 200 : 503 }) });
await probe.probeAvailability(); await probe.probeAvailability(); assert.equal(messages.length, 0);
await probe.probeAvailability(); assert.equal(messages.length, 1);
now += 60000; await probe.probeAvailability(); assert.equal(messages.length, 1);
available = true; await probe.probeAvailability(); assert.equal(messages.length, 1);
await probe.probeAvailability(); assert.equal(messages.length, 2); assert.equal(state.alerted, false);
console.log("Operations external probe persistence and recovery self-test passed");
