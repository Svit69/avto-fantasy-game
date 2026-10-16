import assert from "node:assert/strict";
import { KhlOnlineAdminNotifier } from "./KhlOnlineAdminNotifier.js";
import { calendarMatch, createProvider, players } from "./khl-online-test-context.js";

const sent = new Set(); const messages = [];
let fail = false;
const botClient = { hasToken: () => true, callJson: async (method, payload) => {
  messages.push({ method, payload }); return fail ? { ok: false, error_code: 429 } : { ok: true };
} };
const notificationRepository = { hasNotificationBeenSent: async (id, key) => sent.has(`${id}:${key}`),
  markNotificationAsSent: async (id, key) => sent.add(`${id}:${key}`) };
const notifier = new KhlOnlineAdminNotifier({ botClient, adminIds: ["1", "2"], notificationRepository });
const match = await createProvider().getMatch();
const result = { match, playerStats: [{ playerId: "galkin", fantasyPoints: 66 }] };
await notifier.notifyOnce(calendarMatch, "final", result, players);
await notifier.notifyOnce(calendarMatch, "final", result, players);
assert.equal(messages.length, 2); assert.match(messages[0].payload.text, /4:0/);
assert.match(messages[0].payload.text, /Галкин Владимир: 66 ФО/);
fail = true;
await assert.rejects(() => notifier.notifyOnce(calendarMatch, "interim", result), /429/);
assert.equal([...sent].some((key) => key.endsWith(":interim")), false);
fail = false;
await notifier.notifyOnce(calendarMatch, "interim", result);
assert.equal([...sent].filter((key) => key.endsWith(":interim")).length, 2);
console.log("KHL admin notification deduplication, results and failed Telegram receipts self-test passed");
