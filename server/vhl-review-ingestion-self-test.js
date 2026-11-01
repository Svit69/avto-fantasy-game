import assert from "node:assert/strict";
import { createVhlReviewFixture } from "./vhl-review-test-fixture.js";
import { VhlOnlineDataProvider } from "./VhlOnlineDataProvider.js";
import { VhlReviewedMatchIdentityGuard } from "./VhlReviewedMatchIdentityGuard.js";
import { VhlOnlinePollingService } from "./VhlOnlinePollingService.js";
import { VhlMatchReviewPollingCoordinator } from "./VhlMatchReviewPollingCoordinator.js";
import { VhlMatchReviewMessageFactory } from "./VhlMatchReviewMessageFactory.js";
import { VhlOnlineAdminNotifier } from "./VhlOnlineAdminNotifier.js";
import { AdminVhlMatchReviewController } from "./AdminVhlMatchReviewController.js";

const fixture = await createVhlReviewFixture(); const original = VhlOnlineDataProvider.prototype.getMatch;
try {
  const { repository, policy, match, source, proposal } = fixture; let imports = 0;
  const guard = new VhlReviewedMatchIdentityGuard(repository, policy);
  VhlOnlineDataProvider.prototype.getMatch = async function () { await guard.validate(source, this.identity.expectedMatch); return { ...match, status: "finished" }; };
  const calendarRepository = { listCalendar: async () => ({ matches: [match] }) };
  const reviewMessages = new VhlMatchReviewMessageFactory(repository, policy);
  const notifier = new VhlOnlineAdminNotifier({ reviewMessages, adminIds: [1], botClient: { hasToken: () => true, callMethod: async () => {} },
    notificationRepository: { hasNotificationBeenSent: async () => false, markNotificationAsSent: async () => {} } });
  const service = new VhlOnlinePollingService({ calendarRepository, adminNotifier: notifier, logger: { warn() {}, info() {} },
    reviewCoordinator: new VhlMatchReviewPollingCoordinator(repository, policy), selector: { findActiveMatches: () => [{ ...match, isLivePollingWindow: true }] },
    khlServiceFactory: { createPlayerCatalogRepository: () => ({ listPlayers: async () => [] }),
      createIngestionService: () => ({ ingestMatch: async () => { imports += 1; return { ok: true, match: { ...match, status: "finished" }, playerStats: [] }; } }) } });
  assert.equal((await service.pollActiveMatches())[0].reviewStatus, "pending"); assert.equal(imports, 0);
  const controller = new AdminVhlMatchReviewController({ repository, policy, calendarRepository });
  const approve = (id) => controller.executeRoute({ chatId: 1, userId: 1, route: { playerId: id, value: "yes" } });
  await approve(proposal.id);
  source.awayTeam = "Торос Нефтекамск новый вариант";
  assert.equal((await service.pollActiveMatches())[0].reviewStatus, "pending"); assert.equal(imports, 0);
  const replacement = policy.createProposal(match, source);
  await approve(replacement.id);
  assert.equal((await service.pollActiveMatches())[0].ok, true); assert.equal(imports, 1);
  assert.ok((await repository.findReview(replacement.id)).collectedAt);
  console.log("VHL blocked import, Telegram decision, changed-page revalidation and successful collection self-test passed");
} finally { VhlOnlineDataProvider.prototype.getMatch = original; await fixture.dispose(); }
