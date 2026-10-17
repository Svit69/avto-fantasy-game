import assert from "node:assert/strict";
import { MhlOnlineWorkerFactory } from "./MhlOnlineWorkerFactory.js";
import { MhlMirrorDataProvider } from "./MhlMirrorDataProvider.js";
import { KhlOnlineAdminNotifier } from "./KhlOnlineAdminNotifier.js";
import { calendarMatch, players, createProvider } from "./mhl-online-test-context.js";

const factory = new MhlOnlineWorkerFactory(process.cwd(), { info() {}, warn() {} });
const service = factory.createPollingService();
assert.equal(service.configuration.key, "mhl"); assert.equal(service.selector.configuration.gameIdField, "mhlGameId");
assert.equal(service.collector.configuration.key, "mhl"); assert.equal(service.notifier.configuration.league, "МХЛ");
assert.ok(service.intervalMs >= 300000); assert.ok(service.collector.finalDelayMs >= 300000);
assert.ok(factory.createDataProvider({ gameId: "903207", players }) instanceof MhlMirrorDataProvider);
const sent = new Set(); const messages = [];
const botClient = { hasToken: () => true, callJson: async (method, payload) => { messages.push(payload); return { ok: true }; } };
const notificationRepository = { hasNotificationBeenSent: async (id, key) => sent.has(key), markNotificationAsSent: async (id, key) => sent.add(key) };
Object.assign(service.notifier, { botClient, notificationRepository, adminIds: ["test-admin"] });
const match = await createProvider().getMatch();
const result = { match, playerStats: [{ playerId: "gamzakov", fantasyPoints: 13 }] };
await service.notifier.notifyOnce(calendarMatch, "final", result, players, "Не найдены в базе: Привалов Егор");
await service.notifier.notifyOnce(calendarMatch, "final", result, players);
assert.equal(messages.length, 1); assert.match(messages[0].text, /МХЛ онлайн/); assert.match(messages[0].text, /ID: 903207/);
assert.match(messages[0].text, /Гамзаков Михаил: 13 ФО/); assert.match(messages[0].text, /Привалов Егор/);
await new KhlOnlineAdminNotifier({ botClient, notificationRepository, adminIds: ["test-admin"] })
  .notifyOnce({ ...calendarMatch, khlGameId: "902107" }, "final", result, players);
assert.equal(messages.length, 2); assert.equal(sent.size, 2);
console.log("MHL production factory configuration and independent admin notification receipts self-test passed");
