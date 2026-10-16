import assert from "node:assert/strict";
import path from "node:path";
import { DraftNotificationDispatcher } from "./DraftNotificationDispatcher.js";
import { NotificationSentRepository } from "./NotificationSentRepository.js";
import { createOperationsTestWorkspace } from "./operations-test-workspace.js";
const workspace = await createOperationsTestWorkspace();
try {
  const file = path.join(workspace.directory, "sent.json"); let calls = 0; let accepted = false;
  const bot = { callMethod: async (method, payload) => {
    assert.equal(method, "sendMessage"); assert.equal(payload.parse_mode, "HTML"); calls++;
    return new Response(JSON.stringify({ ok: accepted, description: accepted ? undefined : "rejected" }), { status: 200 });
  } };
  const logger = { info: () => {}, warn: () => {} }; const limiter = { waitForNextDeliverySlot: async () => {} };
  const job = { userId: "1", key: "tour-result:october:winner", text: "<b>Поздравляем!</b>", parseMode: "HTML", verifyTelegramResult: true };
  let dispatcher = new DraftNotificationDispatcher(bot, new NotificationSentRepository(file), logger, limiter);
  assert.equal((await dispatcher.dispatchNotificationJobs([job])).failed, 1);
  assert.equal(await dispatcher.sentRepository.hasNotificationBeenSent("1", job.key), false, "HTTP 200 with Telegram ok:false is not a successful delivery");
  accepted = true;
  assert.equal((await dispatcher.dispatchNotificationJobs([job])).sent, 1);
  dispatcher = new DraftNotificationDispatcher(bot, new NotificationSentRepository(file), logger, limiter);
  assert.equal((await dispatcher.dispatchNotificationJobs([job])).skipped, 1);
  assert.equal(calls, 2, "Persistent receipts prevent a resend after restart");
  assert.equal((await dispatcher.dispatchNotificationJobs([{ ...job, userId: "99", key: "tour-result:october:admin:top3:0" }])).sent, 1);
} finally { await workspace.close(); }
console.log("Tour result Telegram confirmation and persistent delivery receipts self-test passed");
