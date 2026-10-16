import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { VideoNoteNotificationDelivery } from "./VideoNoteNotificationDelivery.js";
import { RuntimeStateStore } from "./RuntimeStateStore.js";
import { createOperationsTestWorkspace } from "./operations-test-workspace.js";
const workspace = await createOperationsTestWorkspace();
try {
  const store = new RuntimeStateStore(workspace.directory); const logger = { info: () => {}, warn: () => {} };
  let calls = 0;
  const bot = { callJson: async (method, payload) => {
    assert.equal(method, "sendVideoNote"); assert.equal(payload.video_note, "file-id"); calls++;
    await new Promise((resolve) => setTimeout(resolve, 20)); return { ok: true, result: { message_id: 10 } };
  } };
  const job = { userId: "1", key: "player-video:tour-1", playerId: "p", videoNote: "file-id" };
  const delivery = new VideoNoteNotificationDelivery(bot, logger, store);
  const results = await Promise.all([delivery.deliver(job), new VideoNoteNotificationDelivery(bot, logger, store).deliver(job)]);
  assert(results.includes("sent") && results.includes("skipped")); assert.equal(calls, 1);
  assert.equal(await new VideoNoteNotificationDelivery(bot, logger, store).deliver({ ...job, videoNote: "replacement" }), "skipped");
  assert.equal(calls, 1, "Replacing a video must not resend it for the same user and tour");
  assert.equal(await delivery.deliver({ ...job, key: "player-video:tour-2" }), "sent");
  assert.equal(await delivery.deliver({ ...job, userId: "2" }), "sent");
  const uncertain = new VideoNoteNotificationDelivery({ callJson: async () => { throw Error("timeout"); } }, logger, store);
  const unknownJob = { ...job, userId: "unknown" };
  assert.equal(await uncertain.deliver(unknownJob), "failed");
  assert.equal(await delivery.deliver(unknownJob), "skipped", "Never duplicate an ambiguous delivery");
  const rejected = new VideoNoteNotificationDelivery({ callJson: async () => ({ ok: false, error_code: 429, parameters: { retry_after: 90 } }) }, logger, store);
  const retryJob = { ...job, userId: "retry" };
  assert.equal(await rejected.deliver(retryJob), "failed"); assert.equal(await rejected.isDeliveryPending(retryJob), false);
  for (const name of await fs.readdir(workspace.directory)) if (name.endsWith(".json")) {
    const receipt = await store.readState(name);
    if (receipt?.userId === "retry") { assert.equal(receipt.status, "rejected"); await store.writeState(name, { ...receipt, retryAt: 0 }); }
  }
  assert.equal(await delivery.deliver(retryJob), "sent", "Retry a definitive Telegram rejection after cooldown");
  const blocked = new VideoNoteNotificationDelivery({ callJson: async () => ({ ok: false, error_code: 403 }) }, logger, store);
  assert.equal(await blocked.deliver({ ...job, userId: "blocked" }), "failed");
  assert.equal(await delivery.deliver({ ...job, userId: "blocked" }), "skipped");
  await Promise.all([1, 2].map(() => promisify(execFile)(process.execPath, ["server/player-video-delivery-test-child.js", workspace.directory], { timeout: 15000, windowsHide: true })));
  assert.equal((await fs.readFile(path.join(workspace.directory, "video-events.txt"), "utf8")).trim(), "sent", "Two processes must send only one video");
} finally { await workspace.close(); }
console.log("Player video persistent deduplication, races and uncertain delivery self-test passed");
