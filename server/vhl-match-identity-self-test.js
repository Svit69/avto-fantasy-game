import assert from "node:assert/strict";
import { VhlOnlineDataProvider } from "./VhlOnlineDataProvider.js";
import { VhlReportDataProvider } from "./VhlReportDataProvider.js";
import { VhlOnlinePollingService } from "./VhlOnlinePollingService.js";
import { VhlOnlineCalendarMatchResolver } from "./VhlOnlineCalendarMatchResolver.js";

const expectedMatch = { id: "game", homeTeam: "Горняк-УГМК", awayTeam: "Нефтяник", startsAt: "2026-10-04T11:00:00+03:00", onlineGameId: "904147", tourId: "tour", isLivePollingWindow: true };
const identity = { tournamentId: "tour", scheduledAt: expectedMatch.startsAt, expectedMatch };
assert.equal(new VhlOnlineCalendarMatchResolver().createProviderIdentity(expectedMatch, "904147").expectedMatch, expectedMatch);
const sourceMatch = { homeTeam: expectedMatch.homeTeam, awayTeam: expectedMatch.awayTeam, scheduledAt: "2026-10-04T00:00:00+03:00" };

for (const provider of [new VhlOnlineDataProvider({ onlineGameId: "904147", players: [], identity }),
  new VhlReportDataProvider({ source: { gameId: "904147", url: "report" }, players: [], identity })]) {
  provider.htmlSource = { loadHtml: async () => "match page" };
  provider.matchParser = { parseMatch: () => ({ ...sourceMatch, awayTeam: "Другая команда" }) };
  await assert.rejects(provider.getMatch(), { message: "vhl_match_identity_mismatch" });
  provider.matchParser = { parseMatch: () => ({ ...sourceMatch, scheduledAt: "2026-10-05T00:00:00+03:00" }) };
  await assert.rejects(provider.getMatch(), { message: "vhl_match_identity_mismatch" });
  provider.matchParser = { parseMatch: () => sourceMatch };
  const match = await provider.getMatch();
  assert.equal(match.scheduledAt, expectedMatch.startsAt);
  assert.equal(match.expectedMatch, undefined);
}

const notifications = [];
const service = new VhlOnlinePollingService({ calendarRepository: { listCalendar: async () => ({ matches: [expectedMatch] }) },
  selector: { findActiveMatches: (calendar) => calendar.matches },
  khlServiceFactory: { createPlayerCatalogRepository: () => ({ listPlayers: async () => [] }),
    createIngestionService: () => { throw new Error("ingestion_must_not_start"); } },
  adminNotifier: { notifyMatchStarted: () => notifications.push("started"), notifyProtocolMismatch: () => notifications.push("mismatch"),
    notifyProtocolUnavailable: () => notifications.push("unavailable") },
  logger: { warn: () => {}, info: () => {} } });
const originalGetMatch = VhlOnlineDataProvider.prototype.getMatch;
VhlOnlineDataProvider.prototype.getMatch = async () => { throw Object.assign(new Error("vhl_match_identity_mismatch"), { sourceMatch }); };
try {
  const [result] = await service.pollActiveMatches();
  assert.equal(result.reason, "vhl_match_identity_mismatch");
  assert.deepEqual(notifications, ["mismatch"]);
  VhlOnlineDataProvider.prototype.getMatch = async () => { throw new Error("vhl_online_game_not_found"); };
  assert.equal((await service.pollActiveMatches())[0].reason, "vhl_online_game_not_found");
  assert.deepEqual(notifications, ["mismatch", "unavailable"]);
} finally { VhlOnlineDataProvider.prototype.getMatch = originalGetMatch; }
console.log("VHL match identity self-test passed");
