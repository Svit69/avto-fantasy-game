import assert from "node:assert/strict";
import { createVhlReviewFixture } from "./vhl-review-test-fixture.js";
import { VhlReviewedMatchIdentityGuard } from "./VhlReviewedMatchIdentityGuard.js";
import { VhlOnlineDataProvider } from "./VhlOnlineDataProvider.js";
import { VhlReportDataProvider } from "./VhlReportDataProvider.js";

const fixture = await createVhlReviewFixture();
try {
  const { repository, policy, match, source, proposal } = fixture;
  const guard = new VhlReviewedMatchIdentityGuard(repository, policy);
  await assert.rejects(guard.validate(source, match), /identity_mismatch/);
  await repository.createReview(proposal);
  await assert.rejects(guard.validate(source, match), /identity_mismatch/);
  await repository.decideReview(proposal.id, "approved", 1);
  await guard.validate(source, match);
  for (const actual of [{ ...source, awayTeam: "Другой клуб" }, { ...source, gameId: "904301" },
    { ...source, homeTeam: "Другой клуб" }, { ...source, scheduledAt: "2000-01-01T00:00:00Z" }]) {
    await assert.rejects(guard.validate(actual, match), /identity_mismatch/);
  }
  await assert.rejects(guard.validate(source, { ...match, id: "another-match" }), /identity_mismatch/);
  const identity = { expectedMatch: match, scheduledAt: match.startsAt };
  for (const provider of [new VhlOnlineDataProvider({ onlineGameId: source.gameId, players: [], identity }),
    new VhlReportDataProvider({ source: { gameId: source.gameId, url: "fixture" }, players: [], identity })]) {
    provider.identityGuard = guard; provider.htmlSource = { loadHtml: async () => "fixture" };
    provider.matchParser = { parseMatch: () => ({ ...source }) };
    const result = await provider.getMatch();
    assert.equal(result.awayTeam, match.awayTeam); assert.equal(result.opponentTeam, match.awayTeam);
  }
  fixture.advance(7 * 86400000 + 1);
  await assert.rejects(guard.validate(source, match), /identity_mismatch/);
  console.log("VHL approved match-only identity, online/report provider parity and expired approvals self-test passed");
} finally { await fixture.dispose(); }
