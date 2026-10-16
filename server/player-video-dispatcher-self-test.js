import assert from "node:assert/strict";
import { DraftNotificationDispatcher } from "./DraftNotificationDispatcher.js";
import { VideoNoteNotificationDelivery } from "./VideoNoteNotificationDelivery.js";
import { RuntimeStateStore } from "./RuntimeStateStore.js";
import { createOperationsTestWorkspace } from "./operations-test-workspace.js";
const workspace = await createOperationsTestWorkspace();
try {
  const sent = []; const textReceipts = new Set(); const logger = { info: () => {}, warn: () => {} };
  const bot = { callJson: async (method, payload) => { sent.push({ method, payload }); return { ok: true }; },
    callMethod: async (method, payload) => { sent.push({ method, payload }); return { ok: true }; } };
  const dispatcher = new DraftNotificationDispatcher(bot, { hasNotificationBeenSent: async (id, key) => textReceipts.has(`${id}:${key}`),
    markNotificationAsSent: async (id, key) => { textReceipts.add(`${id}:${key}`); } }, logger, { waitForNextDeliverySlot: async () => {} }, 1);
  dispatcher.videoDelivery = new VideoNoteNotificationDelivery(bot, logger, new RuntimeStateStore(workspace.directory));
  const jobs = [1, 2].map((id) => ({ userId: id, key: "tour", playerId: "p", videoNote: "file" }));
  assert.equal((await dispatcher.dispatchNotificationJobs(jobs)).sent, 1);
  const resumed = await dispatcher.dispatchNotificationJobs(jobs);
  assert.equal(resumed.skipped, 1); assert.equal(resumed.sent, 1, "Completed receipts must not consume the next batch");
  assert.equal((await dispatcher.dispatchNotificationJobs(jobs)).sent, 0);
  assert.equal(sent.length, 2);
  assert.equal((await dispatcher.dispatchNotificationJobs([{ userId: 3, key: "text", text: "Обычное сообщение" }])).sent, 1);
  assert.equal(sent[2].method, "sendMessage");
  assert.equal(sent[0].method, "sendVideoNote");
  dispatcher.videoDelivery = { isDeliveryPending: async (job) => { if (job.userId === 4) throw Error("corrupt receipt"); return true; }, deliver: async () => "sent" };
  const isolated = await dispatcher.dispatchNotificationJobs([4, 5].map((userId) => ({ userId, key: "isolated", videoNote: "file" })));
  assert.equal(isolated.failed, 1); assert.equal(isolated.sent, 1, "A broken delivery must not block other users");
} finally { await workspace.close(); }
console.log("Player video rate-limited batch continuation and text notification compatibility self-test passed");
