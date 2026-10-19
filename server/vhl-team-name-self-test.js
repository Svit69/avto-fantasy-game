import assert from "node:assert/strict";
import { VhlTeamNameNormalizer } from "./VhlTeamNameNormalizer.js";
import { VhlMatchIdentityGuard } from "./VhlMatchIdentityGuard.js";
import { VhlOnlineDataProvider } from "./VhlOnlineDataProvider.js";
import { VhlReportDataProvider } from "./VhlReportDataProvider.js";
import { WorkerHeartbeat } from "./WorkerHeartbeat.js";

const normalizer = new VhlTeamNameNormalizer(); const guard = new VhlMatchIdentityGuard();
const expected = { homeTeam: "Калуга", awayTeam: "Горняк-УГМК", startsAt: "2026-10-18T17:00:00+03:00" };
const source = { homeTeam: "ХК Калуга", awayTeam: "Горняк-УГМК", scheduledAt: "2026-10-18T00:00:00+03:00", gameId: "904210" };
assert.doesNotThrow(() => guard.validate(source, expected));
for (const name of ["Калуга", "Норильск", "Сочи"]) for (const variant of [`ХК ${name}`, `хк «${name}»`, `ХК\u00a0${name}`, `«ХК ${name}»`, `ХК"${name}"`]) {
  assert.equal(normalizer.createComparisonKey(variant), normalizer.createComparisonKey(name));
  assert.doesNotThrow(() => guard.validate({ ...source, homeTeam: variant }, { ...expected, homeTeam: name }));
}
for (const [actual, required] of [["ХК Калуга-2", "Калуга"], ["ХК Сочи", "Сочи-Юниор"], ["ХКМ", "М"], ["ХК Сокол", "Сокол Красноярск"]]) {
  assert.throws(() => guard.validate({ ...source, homeTeam: actual }, { ...expected, homeTeam: required }), /identity_mismatch/);
}
assert.throws(() => guard.validate({ ...source, scheduledAt: "2026-10-19T00:00:00+03:00" }, expected), /identity_mismatch/);
assert.throws(() => guard.validate({ ...source, homeTeam: source.awayTeam, awayTeam: source.homeTeam }, expected), /identity_mismatch/);
assert.throws(() => guard.validate({ ...source, homeTeam: "", awayTeam: "" }, { ...expected, homeTeam: "", awayTeam: "" }), /identity_mismatch/);
const identity = { expectedMatch: expected, scheduledAt: expected.startsAt };
for (const provider of [new VhlOnlineDataProvider({ onlineGameId: "904210", players: [], identity }),
  new VhlReportDataProvider({ source: { gameId: "904210", url: "report" }, players: [], identity })]) {
  provider.htmlSource = { loadHtml: async () => "fixture" }; provider.matchParser = { parseMatch: () => source };
  const result = await provider.getMatch();
  assert.equal(result.homeTeam, "Калуга"); assert.equal(result.opponentTeam, "Калуга");
  assert.equal(result.awayTeam, "Горняк-УГМК"); assert.equal(result.scheduledAt, expected.startsAt);
}
assert.equal(source.homeTeam, "ХК Калуга"); assert.equal(expected.homeTeam, "Калуга");
let state = { consecutiveFailedCycles: 431, failedMatches: 1 };
const heartbeat = new WorkerHeartbeat({ readState: async () => state, writeState: async (name, value) => { state = value; } });
await heartbeat.recordCycle(async () => [{ ok: true }]);
assert.equal(state.consecutiveFailedCycles, 0); assert.equal(state.failedMatches, 0);
console.log("VHL optional HK prefix, canonical team display, identity protection and heartbeat recovery self-test passed");
