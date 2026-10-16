import assert from "node:assert/strict";
import path from "node:path";
import { PlayerVideoNotificationScheduler } from "./PlayerVideoNotificationScheduler.js";
import { NotificationWorkerLock } from "./NotificationWorkerLock.js";
import { createOperationsTestWorkspace } from "./operations-test-workspace.js";
const workspace = await createOperationsTestWorkspace();
const previousEnabled = process.env.PLAYER_VIDEO_NOTIFICATIONS_ENABLED; delete process.env.PLAYER_VIDEO_NOTIFICATIONS_ENABLED;
try {
  const first = new NotificationWorkerLock(path.join(workspace.directory, "notifications"));
  const second = new NotificationWorkerLock(path.join(workspace.directory, "notifications"));
  assert.equal(await first.acquireLock(), true);
  assert.equal(await second.acquireLock(), false, "Main scheduler and cron must share one lock");
  await first.releaseLock(); assert.equal(await second.acquireLock(), true); await second.releaseLock();
  let finish; let calls = 0; let releases = 0;
  const scheduler = new PlayerVideoNotificationScheduler({ rootDirectory: workspace.directory, botClient: { hasToken: () => true }, logger: { warn: () => {} },
    lock: { acquireLock: async () => true, releaseLock: async () => { releases++; } },
    createWorker: () => ({ processDueNotifications: () => { calls++; return new Promise((resolve) => { finish = resolve; }); } }) });
  const running = scheduler.runOnce(); await new Promise((resolve) => setTimeout(resolve, 0));
  assert.deepEqual(await scheduler.runOnce(), { skipped: true });
  finish({ sent: 1 }); await running; assert.equal(calls, 1); assert.equal(releases, 1);
  scheduler.createWorker = () => ({ processDueNotifications: async () => { throw Error("offline"); } });
  await assert.rejects(scheduler.runOnce(), /offline/); assert.equal(releases, 2);
  scheduler.lock = { acquireLock: async () => false };
  assert.deepEqual(await scheduler.runOnce(), { skipped: true });
  scheduler.stop();
  let starts = 0;
  scheduler.logger = { warn: () => {}, info: () => { starts++; } };
  scheduler.lock = { acquireLock: async () => true, releaseLock: async () => {} };
  scheduler.createWorker = () => ({ processDueNotifications: async () => { calls++; return {}; } });
  scheduler.start(); scheduler.start(); await new Promise((resolve) => setTimeout(resolve, 1100)); scheduler.stop();
  assert.equal(starts, 1); assert.equal(calls, 2, "Server startup must automatically run one video notification cycle");
} finally {
  if (previousEnabled === undefined) delete process.env.PLAYER_VIDEO_NOTIFICATIONS_ENABLED; else process.env.PLAYER_VIDEO_NOTIFICATIONS_ENABLED = previousEnabled;
  await workspace.close();
}
console.log("Player video scheduler overlap and shared worker lock self-test passed");
