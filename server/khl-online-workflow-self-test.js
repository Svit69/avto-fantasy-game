import assert from "node:assert/strict";
import { createMemoryFactory, createProvider, calendarMatch, fixture } from "./khl-online-test-context.js";
import { KhlOnlineMatchCollector } from "./KhlOnlineMatchCollector.js";
import { KhlOnlineMatchSelector } from "./KhlOnlineMatchSelector.js";
import { KhlOnlinePollingService } from "./KhlOnlinePollingService.js";
import { KhlWorkerMonitor } from "./KhlWorkerMonitor.js";

const notices = new Set();
const notifier = { notifyOnce: async (match, stage) => { notices.add(stage); } };
const factory = createMemoryFactory();
const now = Date.now();
const live = structuredClone(fixture); live.gameItem.status = 10; live.gameItem.statusvalue = "1 период";
const liveCollector = new KhlOnlineMatchCollector({ factory, notifier, providerFactory: () => createProvider(live), clock: () => now });
assert.equal((await liveCollector.collectMatch(calendarMatch, {}, now)).state.finishedAt, null);
assert.equal(notices.has("interim"), true);
const scheduled = structuredClone(fixture); scheduled.gameItem.status = 0; scheduled.gameItem.statusvalue = "ожидание";
const scheduledFactory = createMemoryFactory();
await new KhlOnlineMatchCollector({ factory: scheduledFactory, notifier, providerFactory: () => createProvider(scheduled) }).collectMatch(calendarMatch, {}, now);
assert.equal(scheduledFactory.data.writes, 0);
const collector = new KhlOnlineMatchCollector({ factory, notifier, providerFactory: () => createProvider(), clock: () => now });
const first = await collector.collectMatch(calendarMatch, {}, now);
assert.equal(first.state.finishedAt, now); assert.equal(first.state.completedAt, null);
assert.equal(notices.has("final"), false);
const second = await collector.collectMatch(calendarMatch, first.state, now + 1200000);
assert.equal(second.state.completedAt, now + 1200000); assert.equal(notices.has("final"), true);
const selector = new KhlOnlineMatchSelector();
const kickoff = Date.parse(calendarMatch.startsAt);
assert.equal(selector.findDueMatches({ matches: [calendarMatch] }, {}, kickoff - 600001).length, 0);
assert.equal(selector.findDueMatches({ matches: [calendarMatch] }, {}, kickoff - 600000).length, 1);
assert.equal(selector.findDueMatches({ matches: [calendarMatch] }, { [calendarMatch.id]: second.state }, kickoff).length, 0);
assert.equal(selector.findDueMatches({ matches: [calendarMatch] }, {}, kickoff + 172800001).length, 0);
const states = new Map(); const store = { resolveFile: () => "unused", readState: async (key) => states.get(key), writeState: async (key, value) => states.set(key, structuredClone(value)) };
const due = { ...calendarMatch, startsAt: new Date().toISOString() };
const service = new KhlOnlinePollingService({ store, calendarRepository: { listCalendar: async () => ({ matches: [due] }) }, notifier,
  collector: { collectMatch: async () => { throw new Error("source_unavailable"); } }, logger: { warn() {}, info() {} } });
service.lock = { acquireLock: async () => true, releaseLock: async () => {} };
for (let count = 1; count <= 3; count++) {
  const result = await service.pollActiveMatches(); assert.equal(result[0].ok, false);
  assert.equal(notices.has("error"), count === 3);
  const state = states.get("khl-online-matches.json"); state[due.id].nextPollAt = 0;
}
assert.equal(new KhlWorkerMonitor().evaluateConditions({ completedAt: now, processing: false }, now + 600000)[0].active, false);
assert.equal(new KhlWorkerMonitor().evaluateConditions({ completedAt: now, processing: false }, now + 1800001)[0].active, true);
console.log("KHL online final delay, restart state, preparation and failure threshold self-test passed");
