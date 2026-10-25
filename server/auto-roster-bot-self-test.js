import assert from "node:assert/strict";
import { AutoRosterBotController } from "./AutoRosterBotController.js";
import { TelegramWebhookReplyFactory } from "./TelegramWebhookReplyFactory.js";
import { createAutoRosterFixture } from "./auto-roster-test-fixture.js";

const fixture = await createAutoRosterFixture();
try {
  let answered = 0;
  const controller = new AutoRosterBotController({ service: fixture.service, logger: { warn() {} }, botClient: { async callMethod(method) { assert.equal(method, "answerCallbackQuery"); answered++; } } });
  const callback = { callback_query: { id: "c", data: "roster_auto:next", from: { id: 1 }, message: { chat: { id: 1, type: "private" } } } };
  const reply = await controller.createReply(callback);
  assert.match(reply.text, /сохранён/); assert.equal(reply.chat_id, 1);
  assert.equal(new URL(reply.reply_markup.inline_keyboard[0][0].web_app.url).searchParams.get("roster_month"), "next");
  assert.match((await controller.createReply(callback)).text, /не изменило/); assert.equal(answered, 2);
  const forged = structuredClone(callback); forged.callback_query.message.chat.id = 2;
  assert.deepEqual(await controller.createReply(forged), { ok: true });
  assert.equal(await fixture.rosterRepository.findRosterByUserAndMonth(2, "next"), null);
  assert.equal(await controller.createReply({ message: { text: "hello" } }), null);
  const invalid = structuredClone(callback); invalid.callback_query.data = "roster_auto:expired";
  assert.match((await controller.createReply(invalid)).text, /нет открытого тура/);
  const blocked = { message: { text: "Автозаполнение состава", from: { id: 3 }, chat: { id: 3, type: "private" } } };
  assert.match((await controller.createReply(blocked)).text, /зарегистрируйтесь/);
  const keyboard = new TelegramWebhookReplyFactory().createMiniAppMessage(1, "https://example.com").reply_markup.keyboard.flat();
  assert.ok(keyboard.some((button) => button.text === "Автозаполнение состава"));
} finally { await fixture.close(); }
console.log("Autofill private callbacks, ownership, registration, keyboard and saved reply self-test passed");
