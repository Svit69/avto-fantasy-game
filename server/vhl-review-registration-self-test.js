import assert from "node:assert/strict";
import { createVhlReviewFixture } from "./vhl-review-test-fixture.js";
import { VhlMatchReviewRegistrationService } from "./VhlMatchReviewRegistrationService.js";
import { VhlMatchReviewMessageFactory } from "./VhlMatchReviewMessageFactory.js";
import { VhlOnlineProtocolRegistrationService } from "./VhlOnlineProtocolRegistrationService.js";

const fixture = await createVhlReviewFixture();
try {
  const { repository, policy, match, source, proposal } = fixture; const writes = [];
  const calendarRepository = { listMatches: async () => [match], updateMatchOnlineProtocolId: async (id, gameId) => { writes.push([id, gameId]); return match; } };
  const registration = new VhlOnlineProtocolRegistrationService({ calendarRepository,
    view: { renderInvalidProtocolId: () => "invalid" }, htmlSource: { loadHtml: async () => "fixture" }, matchParser: { parseMatch: () => source },
    reviewRegistration: new VhlMatchReviewRegistrationService(policy, new VhlMatchReviewMessageFactory(repository, policy)) });
  const request = { chatId: 1, text: source.gameId, pending: { matchId: match.id } };
  const reply = await registration.registerOnlineProtocol(request);
  assert.match(reply.text, /до подтверждения не загружаются/);
  assert.equal(reply.reply_markup.inline_keyboard.length, 3);
  assert.deepEqual(writes, [[match.id, source.gameId]]);
  assert.equal((await repository.findReview(proposal.id)).status, "pending");
  registration.matchParser = { parseMatch: () => ({ ...source, scheduledAt: "2000-01-01" }) };
  assert.equal(await registration.registerOnlineProtocol(request), "invalid");
  assert.equal(writes.length, 1);
  console.log("VHL ID registration name-review prompt and hard mismatch rejection self-test passed");
} finally { await fixture.dispose(); }
