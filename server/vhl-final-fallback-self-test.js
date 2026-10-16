import assert from "node:assert/strict";
import { VhlFinalDataProvider } from "./VhlFinalDataProvider.js";
import { VhlReportDataProvider } from "./VhlReportDataProvider.js";
import { VhlOnlineDataProvider } from "./VhlOnlineDataProvider.js";
const expectedMatch = { homeTeam: "Рязань-ВДВ", awayTeam: "Горняк-УГМК", startsAt: "2026-10-14T19:00:00+03:00" };
const identity = { expectedMatch, scheduledAt: expectedMatch.startsAt };
const report = new VhlReportDataProvider({ source: { gameId: "904196", url: "report" }, players: [], identity });
report.htmlSource = { loadHtml: async () => '<h1>Протокол игры</h1><div>Календарь</div>' };
await assert.rejects(report.getMatch(), { message: "vhl_report_match_not_found" });
const online = new VhlOnlineDataProvider({ onlineGameId: "904196", players: [], identity });
online.htmlSource = { loadHtml: async () => "online page" };
online.matchParser = { parseMatch: () => ({ homeTeam: expectedMatch.homeTeam, awayTeam: expectedMatch.awayTeam,
  scheduledAt: "2026-10-14T00:00:00+03:00", status: "finished", score: { homeGoals: 5, awayGoals: 3 } }) };
let reads = 0;
online.getPlayByPlay = async () => { reads++; return [{ type: "goal" }]; };
const provider = new VhlFinalDataProvider({ onlineGameId: "904196", identity, reportProvider: report, onlineProvider: online });
assert.equal((await provider.getMatch()).score.homeGoals, 5);
assert.equal((await provider.getMatch()).scheduledAt, expectedMatch.startsAt);
assert.deepEqual(await provider.getPlayByPlay(), [{ type: "goal" }]); assert.equal(reads, 1);
for (const wrong of [{ awayTeam: "Чужой клуб" }, { scheduledAt: "2026-10-15T00:00:00+03:00" }]) {
  const mismatch = new VhlOnlineDataProvider({ onlineGameId: "904196", players: [], identity });
  mismatch.htmlSource = online.htmlSource;
  mismatch.matchParser = { parseMatch: () => ({ ...online.matchParser.parseMatch(), ...wrong }) };
  await assert.rejects(new VhlFinalDataProvider({ reportProvider: report, onlineProvider: mismatch }).getMatch(), { message: "vhl_match_identity_mismatch" });
}
const genuineMismatch = { getMatch: async () => { throw Error("vhl_match_identity_mismatch"); } };
await assert.rejects(new VhlFinalDataProvider({ reportProvider: genuineMismatch, onlineProvider: online }).getMatch(), { message: "vhl_match_identity_mismatch" });
const validReport = { getMatch: async () => ({ ...expectedMatch, source: "report" }), getPlayByPlay: async () => ["report-events"] };
assert.deepEqual(await new VhlFinalDataProvider({ reportProvider: validReport, onlineProvider: online }).getPlayByPlay(), ["report-events"]);
for (const error of [new Error("vhl_online_http_502"), new Error("fetch failed"), Object.assign(new Error("timeout"), { name: "TimeoutError" })]) {
  assert.equal((await new VhlFinalDataProvider({ reportProvider: { getMatch: async () => { throw error; } }, onlineProvider: online }).getMatch()).score.awayGoals, 3);
}
console.log("VHL final report fallback preserves source identity and score self-test passed");
