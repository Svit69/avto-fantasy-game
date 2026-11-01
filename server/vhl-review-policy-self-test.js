import assert from "node:assert/strict";
import { createVhlReviewFixture } from "./vhl-review-test-fixture.js";
import { VhlTeamSimilarityCalculator } from "./VhlTeamSimilarityCalculator.js";

const fixture = await createVhlReviewFixture();
try {
  const { match, source, policy, proposal } = fixture;
  assert.equal(proposal.expectedName, "Торос"); assert.equal(proposal.sourceName, source.awayTeam);
  assert.equal(proposal.id.length, 24);
  assert.deepEqual(policy.createProposal(match, { ...source, scheduledAt: `${source.scheduledAt.slice(0, 10)}T19:30:00Z` }), proposal);
  assert.ok(policy.createProposal({ ...match, homeTeam: match.awayTeam, awayTeam: match.homeTeam },
    { ...source, homeTeam: source.awayTeam, awayTeam: source.homeTeam }));
  for (const badSource of [{ ...source, homeTeam: "Другая команда" }, { ...source, scheduledAt: "2000-01-01T00:00:00Z" },
    { ...source, homeTeam: source.awayTeam, awayTeam: source.homeTeam }, { ...source, gameId: "904301" },
    { ...source, awayTeam: "" }, { ...source, awayTeam: match.awayTeam }, { ...source, awayTeam: match.homeTeam }]) {
    assert.equal(policy.createProposal(match, badSource), null);
  }
  assert.equal(policy.createProposal({ ...match, id: "" }, source), null);
  assert.equal(policy.createProposal({ ...match, startsAt: "invalid" }, source), null);
  assert.notEqual(policy.createProposal(match, { ...source, awayTeam: "Торос Нефтекамск-2" }).id, proposal.id);
  assert.equal(policy.matchesCalendar(proposal, match), true);
  assert.equal(policy.matchesCalendar(proposal, { ...match, onlineGameId: "904301" }), false);
  const similarity = new VhlTeamSimilarityCalculator();
  assert.equal(similarity.calculateSimilarity("ХК Калуга", "Калуга"), 100);
  assert.ok(similarity.calculateSimilarity("Нефтяник", "Нефтяникк") > 80);
  assert.equal(similarity.calculateSimilarity("", "Калуга"), 0);
  console.log("VHL review proposal, similarity, exact fingerprint and hard date/own-team protections self-test passed");
} finally { await fixture.dispose(); }
