import assert from "node:assert/strict";
import { RuntimeStateStore } from "./RuntimeStateStore.js";
import { WorkerHeartbeat } from "./WorkerHeartbeat.js";
import { KhlOnlineMatchCollector } from "./KhlOnlineMatchCollector.js";
import { KhlOnlinePollingService } from "./KhlOnlinePollingService.js";
import { createOperationsTestWorkspace } from "./operations-test-workspace.js";
import { createMemoryFactory, createProvider, calendarMatch } from "./khl-online-test-context.js";

const workspace = await createOperationsTestWorkspace();
try {
  const store = new RuntimeStateStore(workspace.directory); const factory = createMemoryFactory();
  const deliveries = new Set(); const notifier = { notifyOnce: async (match, stage) => deliveries.add(stage) };
  let now = Date.now();
  const collector = new KhlOnlineMatchCollector({ factory, notifier, clock: () => now, providerFactory: () => createProvider() });
  const options = { store, collector, notifier, calendarRepository: { listCalendar: async () => ({ matches: [calendarMatch] }) },
    selector: { findDueMatches: (calendar, states) => calendar.matches.filter((match) => !states[match.id]?.completedAt) }, logger: { warn() {}, info() {} } };
  const firstWorker = new KhlOnlinePollingService(options);
  const concurrentWorker = new KhlOnlinePollingService(options);
  assert.equal(await firstWorker.lock.acquireLock(), true);
  assert.deepEqual(await concurrentWorker.pollActiveMatches(), []);
  await firstWorker.lock.releaseLock();
  await firstWorker.pollActiveMatches();
  const firstState = (await store.readState("khl-online-matches.json"))[calendarMatch.id];
  assert.ok(firstState.finishedAt); assert.equal(firstState.completedAt, null);
  assert.equal(deliveries.has("final"), false);
  now = firstState.finishedAt + 1200000;
  const restartedWorker = new KhlOnlinePollingService(options);
  await restartedWorker.pollActiveMatches();
  assert.equal(deliveries.has("final"), true);
  const writes = factory.data.writes;
  assert.deepEqual(await new KhlOnlinePollingService(options).pollActiveMatches(), []);
  assert.equal(factory.data.writes, writes);
  await new WorkerHeartbeat(store, "khl-heartbeat.json").recordCycle(async () => [{ ok: true }]);
  assert.equal((await store.readState("khl-heartbeat.json")).checkedMatches, 1);
  assert.equal(await store.readState("vhl-heartbeat.json"), null);
} finally { await workspace.close(); }
console.log("KHL online persistent finalization, worker lock and separate heartbeat self-test passed");
