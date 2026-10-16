import assert from "node:assert/strict";
import { TelegramAdminPanelController } from "./TelegramAdminPanelController.js";
import { AdminAccessPolicy } from "./AdminAccessPolicy.js";
import { AdminRouteParser } from "./AdminRouteParser.js";
import { AdminConversationStateStore } from "./AdminConversationStateStore.js";
import { AdminPanelRouteHandler } from "./AdminPanelRouteHandler.js";
const stateStore = new AdminConversationStateStore(); let reads = 0; let received;
const routeHandler = new AdminPanelRouteHandler({ stateStore, view: { renderAccessDenied: () => ({ denied: true }) },
  playerVideoController: { executeRoute: async () => { reads++; return { ok: true }; }, handlePendingInput: async (source) => { received = source.videoNote; return { ok: true }; } } });
const controller = new TelegramAdminPanelController({ accessPolicy: new AdminAccessPolicy([1]), routeParser: new AdminRouteParser(),
  routeHandler, stateStore, botClient: { callMethod: async () => {} }, logger: { warn: () => {} } });
const callback = (id) => ({ callback_query: { id: "callback", data: "admin:video_list:0", from: { id }, message: { chat: { id } } } });
assert.deepEqual(await controller.createReply(callback(99)), { denied: true }); assert.equal(reads, 0);
stateStore.waitForPlayerVideoNote(1, "p");
assert.deepEqual(await controller.createReply(callback(1)), { ok: true });
assert.equal(stateStore.consumeState(1), null, "Navigation must cancel stale upload state");
stateStore.waitForPlayerVideoNote(1, "p");
const video = { file_id: "telegram-file", file_unique_id: "unique", duration: 10 };
await controller.createReply({ message: { chat: { id: 1 }, from: { id: 1 }, video_note: video } });
assert.deepEqual(received, video, "Pass Telegram video_note to the pending upload handler");
assert.equal(stateStore.consumeState(1), null);
console.log("Player video administrator access and pending upload routing self-test passed");
