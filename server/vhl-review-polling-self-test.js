import assert from "node:assert/strict";
import { createVhlReviewFixture } from "./vhl-review-test-fixture.js";
import { VhlMatchReviewPollingCoordinator } from "./VhlMatchReviewPollingCoordinator.js";
import { VhlOnlineActiveMatchSelector } from "./VhlOnlineActiveMatchSelector.js";
import { WorkerHeartbeat } from "./WorkerHeartbeat.js";

const fixture = await createVhlReviewFixture();
try {
  const { repository, policy, match, proposal } = fixture;
  const coordinator = new VhlMatchReviewPollingCoordinator(repository, policy); const selector = new VhlOnlineActiveMatchSelector();
  const calendar = { matches: [match] };
  assert.equal(selector.findActiveMatches(calendar, fixture.getNow()).length, 0);
  await repository.createReview(proposal);
  assert.equal((await coordinator.findPollableMatches(calendar, selector, fixture.getNow())).length, 0);
  await repository.decideReview(proposal.id, "approved", 1);
  const queued = await coordinator.findPollableMatches(calendar, selector, fixture.getNow());
  assert.equal(queued.length, 1); assert.equal(queued[0].isLivePollingWindow, false);
  assert.equal((await coordinator.findPollableMatches({ matches: [{ ...match, onlineProtocolId: "904301" }] }, selector, fixture.getNow())).length, 0);
  assert.equal((await coordinator.findPollableMatches({ matches: [{ ...match, awayTeam: "Другой клуб" }] }, selector, fixture.getNow())).length, 0);
  await coordinator.markCollected(match);
  assert.ok((await repository.findReview(proposal.id)).collectedAt);
  assert.equal((await coordinator.findPollableMatches(calendar, selector, fixture.getNow())).length, 0);
  let state = { consecutiveFailedCycles: 431 };
  const heartbeat = new WorkerHeartbeat({ readState: async () => state, writeState: async (name, value) => { state = value; } });
  await heartbeat.recordCycle(async () => [{ ok: null, reviewStatus: "pending" }, { ok: null, reviewStatus: "rejected" }]);
  assert.equal(state.failedMatches, 0); assert.equal(state.consecutiveFailedCycles, 0);
  assert.equal(state.awaitingReviewMatches, 1); assert.equal(state.rejectedReviewMatches, 1);
  await heartbeat.recordCycle(async () => [{ ok: false, reason: "fetch failed" }]);
  assert.equal(state.failedMatches, 1); assert.equal(state.consecutiveFailedCycles, 1);
  console.log("VHL approved retry beyond 48 hours, changed-ID exclusion and review-aware heartbeat self-test passed");
} finally { await fixture.dispose(); }
