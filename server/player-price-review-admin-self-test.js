import assert from "node:assert/strict";
import { PlayerPriceReviewTestFixtures } from "./PlayerPriceReviewTestFixtures.js";
import { PlayerPriceReviewService } from "./PlayerPriceReviewService.js";
import { AdminPriceReviewController } from "./AdminPriceReviewController.js";
import { AdminPriceReviewView } from "./AdminPriceReviewView.js";
import { AdminPanelRouteHandler } from "./AdminPanelRouteHandler.js";
import { AdminKeyboardFactory } from "./AdminKeyboardFactory.js";
import { AdminAccessPolicy } from "./AdminAccessPolicy.js";
import { AdminRouteParser } from "./AdminRouteParser.js";
import { AdminConversationStateStore } from "./AdminConversationStateStore.js";
import { TelegramAdminPanelController } from "./TelegramAdminPanelController.js";

const fixtures = new PlayerPriceReviewTestFixtures();
const scenario = fixtures.createScenario();
const service = new PlayerPriceReviewService(fixtures.createRepositories(scenario));
const report = await service.createReviewReport();
const view = new AdminPriceReviewView();
assert(new AdminKeyboardFactory().createMenuKeyboard().flat().some((button) => button.callback_data === "admin:price_review:0"));
const expanded = { ...report, recommendations: Array.from({ length: 10 }, () => report.recommendations[0]) };
const first = view.renderReport(1, expanded);
assert(first.text.length < 4096 && !first.text.includes("\uFFFD"));
assert(first.reply_markup.inline_keyboard.flat().some((button) => button.callback_data === "admin:price_review:1"));
assert(view.renderReport(1, expanded, 99).text.includes("Страница 4/4"));
assert(view.renderReport(1, expanded, -1).text.includes("Страница 1/4"));
assert(view.renderExplanation(1).text.includes("коэффициент лиги"));
assert(view.renderExplanation(1).text.length < 4096);
const stateStore = new AdminConversationStateStore();
const priceController = new AdminPriceReviewController({ stateStore, service });
const handler = new AdminPanelRouteHandler({ priceReviewController: priceController, stateStore,
  playerCatalogRepository: { findPlayerById: async (id) => scenario.players.find((player) => player.id === id) },
  view: { renderAccessDenied: () => ({ denied: true }), renderPricePrompt: (_chatId, player) => ({ pricePrompt: player.id }) } });
const controller = new TelegramAdminPanelController({ accessPolicy: new AdminAccessPolicy([1]), routeParser: new AdminRouteParser(),
  routeHandler: handler, stateStore, botClient: { callMethod: async () => {} }, logger: console });
function createCallbackUpdate(data, userId = 1) {
  return { callback_query: { id: "callback", data, from: { id: userId }, message: { chat: { id: 2 } } } };
}
stateStore.waitForPrice(2, "player-0");
const reply = await controller.createReply(createCallbackUpdate("admin:price_review:0"));
assert(reply.text.includes("Помощник стоимости"));
assert.equal(stateStore.consumeState(2), null, "Entering review must clear old pending price input");
const priceButton = reply.reply_markup.inline_keyboard.flat().find((button) => button.callback_data.startsWith("admin:price:"));
assert((await controller.createReply(createCallbackUpdate(priceButton.callback_data))).pricePrompt);
let reads = 0;
priceController.service = { createReviewReport: async () => { reads += 1; return report; } };
assert.deepEqual(await controller.createReply(createCallbackUpdate("admin:price_review:0", 99)), { denied: true });
assert.equal(reads, 0, "Unauthorized user must not read pricing data");
assert((await controller.createReply(createCallbackUpdate("admin:price_review_help"))).text.includes("Как работает помощник"));
assert.equal(reads, 0, "Help must not read the database");
console.log("Player price review admin self-test passed");
