import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createVhlReviewFixture } from "./vhl-review-test-fixture.js";
import { VhlMatchReviewRepository } from "./VhlMatchReviewRepository.js";
import { AtomicJsonDocumentStore } from "./AtomicJsonDocumentStore.js";

const fixture = await createVhlReviewFixture();
try {
  const { repository, proposal, filePath } = fixture;
  const other = new VhlMatchReviewRepository(new AtomicJsonDocumentStore(filePath), fixture.getNow);
  const creations = await Promise.all([repository.createReview(proposal), other.createReview(proposal)]);
  assert.deepEqual(creations[0], creations[1]); assert.equal((await repository.listReviews()).length, 1);
  const decisions = await Promise.all([repository.decideReview(proposal.id, "approved", 1), other.decideReview(proposal.id, "rejected", 2)]);
  assert.equal(decisions.filter(Boolean).length, 1);
  const review = await other.findReview(proposal.id);
  assert.ok(["approved", "rejected"].includes(review.status)); assert.ok(["1", "2"].includes(review.decidedBy));
  assert.equal(await repository.decideReview(proposal.id, "approved", 3), null);
  assert.equal(await repository.decideReview(proposal.id, "invalid", 3), null);
  const expired = { ...proposal, id: "expired" }; await repository.createReview(expired);
  fixture.advance(7 * 86400000 + 1);
  assert.equal(repository.isCurrent(await repository.findReview(expired.id)), false);
  assert.equal(await repository.decideReview(expired.id, "approved", 1), null);
  assert.equal((await repository.createReview(expired)).status, "pending");
  await fs.writeFile(filePath, "broken-json", "utf8");
  await assert.rejects(repository.findReview(proposal.id), SyntaxError);
  console.log("VHL review atomic persistence, concurrent decisions, restart, expiration and corrupt storage self-test passed");
} finally { await fixture.dispose(); }
