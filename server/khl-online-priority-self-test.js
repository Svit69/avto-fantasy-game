import assert from "node:assert/strict";
import { createMemoryFactory, createProvider, calendarMatch } from "./khl-online-test-context.js";
import { MonthlyImportedMatchSelector } from "./MonthlyImportedMatchSelector.js";
import { MonthlyPlayerMatchStatSelector } from "./MonthlyPlayerMatchStatSelector.js";
import { DailyPlayerPointsMatchSelector } from "./DailyPlayerPointsMatchSelector.js";
import { PlayerPriceReviewMatchSelector } from "./PlayerPriceReviewMatchSelector.js";

const manual = { ...calendarMatch, id: "manual-pdf", tournamentId: "1436", gameId: "902107", sourceType: "protocol",
  scheduledAt: calendarMatch.startsAt, status: "finished", updatedAt: "2026-10-06T20:00:00Z" };
const factory = createMemoryFactory([manual]);
const protectedResult = await factory.createIngestionService(createProvider()).ingestMatch("october", "902107");
assert.equal(protectedResult.reason, "manual_protocol_priority"); assert.equal(factory.data.writes, 0);
const hashed = createMemoryFactory([{ ...manual, gameId: "pdf-hash", khlGameId: undefined }]);
assert.equal((await hashed.createIngestionService(createProvider()).ingestMatch("october", "902107")).reason, "manual_protocol_priority");
const onlineFactory = createMemoryFactory();
await onlineFactory.createIngestionService(createProvider()).ingestMatch("october", "902107");
await onlineFactory.createIngestionService({ getMatch: async () => ({ ...manual, sourceType: "protocol" }),
  getPlayByPlay: async () => [] }).ingestMatch("october", "902107");
assert.equal(onlineFactory.data.matches[0].sourceType, "protocol");
const online = { ...manual, id: "online", sourceType: "khl-online", updatedAt: "2026-10-16T20:00:00Z" };
const calendar = { matches: [calendarMatch], tours: [{ id: "october", month: "2026-10" }] };
const database = { matches: [manual, online], playerStats: [
  { matchId: manual.id, playerId: "clague", fantasyPoints: 95 }, { matchId: online.id, playerId: "clague", fantasyPoints: 999 },
  { matchId: online.id, playerId: "not-in-pdf", fantasyPoints: 999 }] };
assert.equal(new MonthlyImportedMatchSelector().selectLatestMonthMatches("2026-10", calendar, database.matches)[0].id, manual.id);
assert.equal(new MonthlyPlayerMatchStatSelector().selectPlayerMatchStats({ playerId: "clague", month: "2026-10", calendar, matchDatabase: database })[0].stat.fantasyPoints, 95);
assert.equal(new MonthlyPlayerMatchStatSelector().selectPlayerMatchStats({ playerId: "not-in-pdf", month: "2026-10", calendar, matchDatabase: database }).length, 0);
assert.equal(new DailyPlayerPointsMatchSelector().selectMatches(calendar, database, "2026-10-06")[0].stats.length, 1);
assert.equal(new PlayerPriceReviewMatchSelector().selectFinishedMatches(database.matches, { matches: calendar.matches, now: new Date("2026-10-17") })[0].id, manual.id);
console.log("KHL online manual protocol priority and authoritative statistics self-test passed");
