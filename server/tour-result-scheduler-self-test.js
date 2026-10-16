import assert from "node:assert/strict";
import { TourResultNotificationScheduler } from "./TourResultNotificationScheduler.js";
import { ScheduledNotificationRunner } from "./ScheduledNotificationRunner.js";
const before = process.env.TOUR_RESULTS_NOTIFICATIONS_ENABLED;
const videoBefore = process.env.PLAYER_VIDEO_NOTIFICATIONS_ENABLED;
try {
  delete process.env.TOUR_RESULTS_NOTIFICATIONS_ENABLED; process.env.PLAYER_VIDEO_NOTIFICATIONS_ENABLED = "false";
  let calls = 0; let starts = 0;
  const scheduler = new TourResultNotificationScheduler({ rootDirectory: ".", botClient: { hasToken: () => true },
    logger: { info: () => { starts++; }, warn: () => {} }, lock: { acquireLock: async () => true, releaseLock: async () => {} },
    createWorker: () => ({ processDueNotifications: async () => { calls++; return {}; } }) });
  assert(scheduler instanceof ScheduledNotificationRunner);
  scheduler.start(); scheduler.start();
  await new Promise((resolve) => setTimeout(resolve, 1100)); scheduler.stop();
  assert.equal(starts, 1); assert.equal(calls, 1, "Results must run automatically even when video notifications are disabled");
  process.env.TOUR_RESULTS_NOTIFICATIONS_ENABLED = "false";
  scheduler.start(); assert.equal(starts, 1); scheduler.stop();
} finally {
  if (before === undefined) delete process.env.TOUR_RESULTS_NOTIFICATIONS_ENABLED; else process.env.TOUR_RESULTS_NOTIFICATIONS_ENABLED = before;
  if (videoBefore === undefined) delete process.env.PLAYER_VIDEO_NOTIFICATIONS_ENABLED; else process.env.PLAYER_VIDEO_NOTIFICATIONS_ENABLED = videoBefore;
}
console.log("Tour results independent automatic scheduler lifecycle self-test passed");
