import assert from "node:assert/strict";
import { createVhlReviewFixture } from "./vhl-review-test-fixture.js";
import { VhlMatchReviewMessageFactory } from "./VhlMatchReviewMessageFactory.js";
import { VhlOnlineAdminNotifier } from "./VhlOnlineAdminNotifier.js";

const fixture = await createVhlReviewFixture();
try {
  const { repository, policy, match, source, proposal } = fixture;
  const reviewMessages = new VhlMatchReviewMessageFactory(repository, policy); const sent = []; const receipts = new Set(); let fail = true;
  const notifier = new VhlOnlineAdminNotifier({ reviewMessages, adminIds: [1, 2],
    botClient: { hasToken: () => true, callMethod: async (method, message) => { if (fail) throw Error("offline"); sent.push(message); } },
    notificationRepository: { hasNotificationBeenSent: async (id, key) => receipts.has(`${id}:${key}`),
      markNotificationAsSent: async (id, key) => receipts.add(`${id}:${key}`) } });
  await notifier.notifyProtocolMismatch(match, source); assert.equal(receipts.size, 0);
  fail = false;
  assert.equal((await notifier.notifyProtocolMismatch(match, source)).status, "pending");
  await notifier.notifyProtocolMismatch(match, source); assert.equal(sent.length, 2);
  assert.match(sent[0].text, /Сходство написания/); assert.match(sent[0].text, /Дата и сторона Горняка совпали/);
  for (const row of sent[0].reply_markup.inline_keyboard) for (const button of row) {
    if (button.url) { assert.equal(button.url, `https://online.vhlru.ru/online/${source.gameId}.html`); continue; }
    assert.ok(Buffer.byteLength(button.callback_data, "utf8") <= 64);
    assert.ok(button.callback_data.startsWith("admin:vhl_online_review:"));
  }
  const hardMismatch = await reviewMessages.createReviewMessage(match, { ...source, scheduledAt: "2000-01-01" }, "blocked");
  assert.equal(hardMismatch.reply_markup, undefined);
  await repository.decideReview(proposal.id, "rejected", 1);
  assert.equal((await notifier.notifyProtocolMismatch(match, source)).status, "rejected");
  assert.equal(sent.length, 2);
  console.log("VHL admin review inline buttons, Telegram limits, receipt retries and rejection deduplication self-test passed");
} finally { await fixture.dispose(); }
