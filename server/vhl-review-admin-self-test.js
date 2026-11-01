import assert from "node:assert/strict";
import { createVhlReviewFixture } from "./vhl-review-test-fixture.js";
import { AdminVhlMatchReviewController } from "./AdminVhlMatchReviewController.js";
import { TelegramAdminPanelController } from "./TelegramAdminPanelController.js";
import { AdminRouteParser } from "./AdminRouteParser.js";
import { AdminAccessPolicy } from "./AdminAccessPolicy.js";

const fixture = await createVhlReviewFixture();
try {
  const { repository, policy, match, proposal } = fixture; let current = { ...match };
  await repository.createReview(proposal);
  const controller = new AdminVhlMatchReviewController({ repository, policy, calendarRepository: { listCalendar: async () => ({ matches: [current] }) } });
  const source = { chatId: 1, userId: 1, route: { playerId: proposal.id, value: "yes" } };
  const panel = new TelegramAdminPanelController({ accessPolicy: new AdminAccessPolicy([1]), routeParser: new AdminRouteParser(),
    stateStore: {}, botClient: { callMethod: async () => {} }, logger: { warn() {} },
    routeHandler: { executeRoute: (input) => controller.executeRoute(input), renderAccessDenied: () => "denied" } });
  const callback = (id) => ({ callback_query: { id: "callback", data: `admin:vhl_online_review:${proposal.id}:yes`, from: { id }, message: { chat: { id } } } });
  assert.equal(await panel.createReply(callback(2)), "denied");
  assert.equal((await repository.findReview(proposal.id)).status, "pending");
  assert.match((await controller.executeRoute({ ...source, chatId: -100 })).text, /личном чате/);
  current = { ...match, onlineProtocolId: "904301" };
  assert.match((await controller.executeRoute(source)).text, /изменились/);
  current = { ...match, awayTeam: "Другой клуб" };
  assert.match((await controller.executeRoute(source)).text, /изменились/);
  current = { ...match };
  assert.match((await panel.createReply(callback(1))).text, /подтверждён/);
  assert.equal((await repository.findReview(proposal.id)).decidedBy, "1");
  assert.match((await controller.executeRoute({ ...source, route: { ...source.route, value: "no" } })).text, /уже принято/);
  fixture.advance(7 * 86400000 + 1);
  assert.match((await controller.executeRoute(source)).text, /устарел/);
  console.log("VHL admin authorization, private callbacks, changed calendar/ID and duplicate decisions self-test passed");
} finally { await fixture.dispose(); }
