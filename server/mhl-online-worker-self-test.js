import assert from "node:assert/strict";
import { RuntimeStateStore } from "./RuntimeStateStore.js";
import { WorkerHeartbeat } from "./WorkerHeartbeat.js";
import { KhlOnlineMatchCollector } from "./KhlOnlineMatchCollector.js";
import { KhlOnlinePollingService } from "./KhlOnlinePollingService.js";
import { KhlOnlineMatchSelector } from "./KhlOnlineMatchSelector.js";
import { OnlineHockeyLeagueConfiguration } from "./OnlineHockeyLeagueConfiguration.js";
import { MirrorWorkerMonitorReader } from "./MirrorWorkerMonitorReader.js";
import { createOperationsTestWorkspace } from "./operations-test-workspace.js";
import { createMemoryFactory, createProvider, calendarMatch } from "./mhl-online-test-context.js";

const configuration = OnlineHockeyLeagueConfiguration.mhl(); const workspace = await createOperationsTestWorkspace();
try {
  const store = new RuntimeStateStore(workspace.directory); const factory = createMemoryFactory(); let now = Date.now();
  const stages = new Set(); let fail = false;
  const notifier = { notifyOnce: async (match, stage) => stages.add(stage) };
  const collector = new KhlOnlineMatchCollector({ factory, notifier, configuration, clock: () => now, providerFactory: () => {
    if (fail) throw new Error("mhl_mirror_CAPTURE_FAILED"); return createProvider();
  } });
  const options = { store, collector, notifier, configuration, calendarRepository: { listCalendar: async () => ({ matches: [calendarMatch] }) },
    selector: { findDueMatches: (calendar, states) => calendar.matches.filter((match) => !states[match.id]?.completedAt) }, logger: { warn() {}, info() {} } };
  const first = new KhlOnlinePollingService(options);
  assert.equal(await first.lock.acquireLock(), true); assert.deepEqual(await new KhlOnlinePollingService(options).pollActiveMatches(), []);
  const khl = new KhlOnlinePollingService({ ...options, configuration: OnlineHockeyLeagueConfiguration.khl() });
  assert.equal(await khl.lock.acquireLock(), true); await khl.lock.releaseLock(); await first.lock.releaseLock();
  fail = true;
  for (let count = 0; count < 3; count++) assert.equal((await first.pollActiveMatches())[0].ok, false);
  assert.equal(stages.has("error"), true); assert.equal(factory.data.writes, 0);
  fail = false; await first.pollActiveMatches();
  const state = (await store.readState("mhl-online-matches.json"))[calendarMatch.id];
  assert.equal(state.failures, 0); assert.ok(state.finishedAt); assert.equal(stages.has("final"), false);
  now = state.finishedAt + 1200000; await new KhlOnlinePollingService(options).pollActiveMatches();
  assert.equal(stages.has("final"), true); assert.deepEqual(await new KhlOnlinePollingService(options).pollActiveMatches(), []);
  assert.equal(await store.readState("khl-online-matches.json"), null);
  await new WorkerHeartbeat(store, "mhl-heartbeat.json").recordCycle(async () => []);
  const monitor = await new MirrorWorkerMonitorReader(store).readWorkers(); assert.ok(monitor.mhlWorker.completedAt); assert.equal(monitor.khlWorker, null);
  const selector = new KhlOnlineMatchSelector(600000, 172800000, configuration); const start = Date.parse(calendarMatch.startsAt);
  assert.equal(selector.findDueMatches({ matches: [calendarMatch] }, {}, start - 600001).length, 0);
  assert.equal(selector.findDueMatches({ matches: [calendarMatch] }, {}, start - 600000).length, 1);
  assert.equal(selector.findDueMatches({ matches: [{ ...calendarMatch, league: "КХЛ" }] }, {}, start).length, 0);
  assert.equal(selector.findDueMatches({ matches: [calendarMatch] }, { [calendarMatch.id]: { nextPollAt: start + 300000 } }, start).length, 0);
  assert.equal(selector.findDueMatches({ matches: [calendarMatch] }, {}, start + 172800001).length, 0);
} finally { await workspace.close(); }
console.log("MHL worker retries, delayed final collection, restart persistence and KHL isolation self-test passed");
