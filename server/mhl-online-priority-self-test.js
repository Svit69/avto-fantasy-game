import assert from "node:assert/strict";
import { createMemoryFactory, createProvider, calendarMatch } from "./mhl-online-test-context.js";
import { MonthlyImportedMatchSelector } from "./MonthlyImportedMatchSelector.js";
import { MonthlyPlayerMatchStatSelector } from "./MonthlyPlayerMatchStatSelector.js";
import { DailyPlayerPointsMatchSelector } from "./DailyPlayerPointsMatchSelector.js";
import { PlayerPriceReviewMatchSelector } from "./PlayerPriceReviewMatchSelector.js";
import { ImportedMatchGameSelector } from "./ImportedMatchGameSelector.js";

const manual = { ...calendarMatch, id: "manual-mhl-pdf", gameId: "903207", sourceType: "protocol", status: "finished",
  scheduledAt: calendarMatch.startsAt, updatedAt: "2026-10-15T18:00:00Z" };
const factory = createMemoryFactory([manual]);
const result = await factory.createIngestionService(createProvider()).ingestMatch(calendarMatch.tourId, "903207");
assert.equal(result.reason, "manual_protocol_priority"); assert.equal(factory.data.writes, 0);
const hashed = createMemoryFactory([{ ...manual, mhlGameId: undefined, gameId: "pdf-hash" }]);
assert.equal((await hashed.createIngestionService(createProvider()).ingestMatch("october", "903207")).reason, "manual_protocol_priority");
const online = { ...manual, id: "mhl-online", sourceType: "mhl-online", updatedAt: "2026-10-17T10:00:00Z" };
const onlineFactory = createMemoryFactory([online]);
assert.equal((await onlineFactory.createIngestionService(createProvider()).ingestMatch("october", "903207")).ok, true);
const calendar = { matches: [calendarMatch], tours: [{ id: calendarMatch.tourId, month: "Октябрь" }] };
const database = { matches: [online, manual], playerStats: [{ matchId: manual.id, playerId: "gamzakov", fantasyPoints: 13 },
  { matchId: online.id, playerId: "gamzakov", fantasyPoints: 999 }, { matchId: online.id, playerId: "not-in-pdf", fantasyPoints: 999 }] };
assert.equal(new MonthlyImportedMatchSelector().selectLatestMonthMatches("Октябрь", calendar, database.matches)[0].id, manual.id);
const select = (playerId) => new MonthlyPlayerMatchStatSelector().selectPlayerMatchStats({ playerId, month: "Октябрь", calendar, matchDatabase: database });
assert.equal(select("gamzakov")[0].stat.fantasyPoints, 13); assert.equal(select("not-in-pdf").length, 0);
assert.equal(new DailyPlayerPointsMatchSelector().selectMatches(calendar, database, "2026-10-15")[0].stats.length, 1);
assert.equal(new PlayerPriceReviewMatchSelector().selectFinishedMatches(database.matches, { matches: calendar.matches, now: new Date("2026-10-18") })[0].id, manual.id);
assert.equal(new ImportedMatchGameSelector().selectMatchByGameId(database.matches, "903207").id, manual.id);
const replacement = createMemoryFactory();
await replacement.createIngestionService(createProvider()).ingestMatch("october", "903207");
await replacement.createIngestionService({ getMatch: async () => ({ ...manual, sourceType: "protocol" }), getPlayByPlay: async () => [] }).ingestMatch("october", "903207");
assert.equal(replacement.data.matches[0].sourceType, "protocol");
console.log("MHL manual PDF priority for ingestion, stats, daily notifications, prices and game API self-test passed");
