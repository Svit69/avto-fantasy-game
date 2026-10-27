import assert from "node:assert/strict";
import { VhlTeamNameNormalizer } from "./VhlTeamNameNormalizer.js";
import { VhlMatchIdentityGuard } from "./VhlMatchIdentityGuard.js";
import { VhlOnlineDataProvider } from "./VhlOnlineDataProvider.js";
import { VhlReportDataProvider } from "./VhlReportDataProvider.js";

const normalizer = new VhlTeamNameNormalizer(); const guard = new VhlMatchIdentityGuard();
const expected = { homeTeam: "Горняк-УГМК", awayTeam: "Сокол", startsAt: "2026-10-27T18:30:00+05:00" };
const source = { gameId: "904254", homeTeam: "Горняк-УГМК", awayTeam: "Сокол Кр", scheduledAt: "2026-10-27T00:00:00+03:00" };
for (const variant of ["Сокол Кр", "СОКОЛ КР", "Сокол Кр.", "ХК «Сокол Кр»", "Сокол\u00a0Кр"]) {
  assert.equal(normalizer.normalizeTeamName(variant), "Сокол");
  assert.doesNotThrow(() => guard.validate({ ...source, awayTeam: variant }, expected));
  assert.doesNotThrow(() => guard.validate({ ...source, awayTeam: "Сокол" }, { ...expected, awayTeam: variant }));
}
for (const awayTeam of ["Сокол-2", "Сокол Кр-2", "Сокол Крылья", "Сокол Красноярск", "Красноярские Рыси"]) {
  assert.throws(() => guard.validate({ ...source, awayTeam }, expected), /identity_mismatch/);
}
assert.throws(() => guard.validate({ ...source, scheduledAt: "2026-10-28T00:00:00+03:00" }, expected), /identity_mismatch/);
assert.throws(() => guard.validate({ ...source, homeTeam: "Другая команда" }, expected), /identity_mismatch/);
assert.throws(() => guard.validate({ ...source, homeTeam: source.awayTeam, awayTeam: source.homeTeam }, expected), /identity_mismatch/);
const identity = { expectedMatch: expected, scheduledAt: expected.startsAt };
for (const provider of [new VhlOnlineDataProvider({ onlineGameId: "904254", players: [], identity }),
  new VhlReportDataProvider({ source: { gameId: "904254", url: "fixture" }, players: [], identity })]) {
  provider.htmlSource = { async loadHtml() { return "fixture"; } };
  provider.matchParser = { parseMatch: () => ({ ...source }) };
  const result = await provider.getMatch();
  assert.equal(result.gameId, "904254"); assert.equal(result.awayTeam, "Сокол");
  assert.equal(result.opponentTeam, "Сокол"); assert.equal(result.scheduledAt, expected.startsAt);
}
assert.equal(normalizer.normalizeMatchTeams(source).awayTeam, "Сокол");
assert.equal(source.awayTeam, "Сокол Кр");
console.log("VHL Sokol Kr alias, canonical display, provider parity and strict match identity self-test passed");
