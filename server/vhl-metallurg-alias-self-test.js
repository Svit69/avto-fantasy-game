import assert from "node:assert/strict";
import { VhlTeamNameNormalizer } from "./VhlTeamNameNormalizer.js";
import { VhlMatchIdentityGuard } from "./VhlMatchIdentityGuard.js";
import { VhlOnlineDataProvider } from "./VhlOnlineDataProvider.js";
import { VhlReportDataProvider } from "./VhlReportDataProvider.js";

const normalizer = new VhlTeamNameNormalizer(); const guard = new VhlMatchIdentityGuard();
const expected = { homeTeam: "Горняк-УГМК", awayTeam: "Металлург Новокузнецк", startsAt: "2026-10-29T18:30:00+05:00" };
const source = { gameId: "904261", homeTeam: "Горняк-УГМК", awayTeam: "Металлург Нк", scheduledAt: "2026-10-29T00:00:00+03:00" };
for (const awayTeam of ["Металлург Нк", "МЕТАЛЛУРГ НК", "Металлург Нк.", "ХК «Металлург Нк»", "Металлург\u00a0Нк"]) {
  assert.equal(normalizer.normalizeTeamName(awayTeam), expected.awayTeam);
  assert.doesNotThrow(() => guard.validate({ ...source, awayTeam }, expected));
  assert.doesNotThrow(() => guard.validate({ ...source, awayTeam: expected.awayTeam }, { ...expected, awayTeam }));
}
for (const awayTeam of ["Металлург", "Металлург Магнитогорск", "Металлург Нк-2", "Металлург Новокузнецк-2"]) {
  assert.throws(() => guard.validate({ ...source, awayTeam }, expected), /identity_mismatch/);
}
assert.throws(() => guard.validate({ ...source, scheduledAt: "2026-10-30T00:00:00+03:00" }, expected), /identity_mismatch/);
assert.throws(() => guard.validate({ ...source, homeTeam: source.awayTeam, awayTeam: source.homeTeam }, expected), /identity_mismatch/);
const identity = { expectedMatch: expected, scheduledAt: expected.startsAt };
for (const provider of [new VhlOnlineDataProvider({ onlineGameId: "904261", players: [], identity }),
  new VhlReportDataProvider({ source: { gameId: "904261", url: "fixture" }, players: [], identity })]) {
  provider.htmlSource = { async loadHtml() { return "fixture"; } };
  provider.matchParser = { parseMatch: () => ({ ...source }) };
  const result = await provider.getMatch();
  assert.equal(result.gameId, source.gameId);
  assert.equal(result.awayTeam, expected.awayTeam);
  assert.equal(result.opponentTeam, expected.awayTeam);
  assert.equal(result.scheduledAt, expected.startsAt);
}
assert.equal(normalizer.normalizeMatchTeams(source).opponentTeam, expected.awayTeam);
assert.equal(source.awayTeam, "Металлург Нк");
console.log("VHL Metallurg Nk alias, provider parity and strict match identity self-test passed");
