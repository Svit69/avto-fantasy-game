import assert from "node:assert/strict";
import { PlayerPriceReviewTestFixtures } from "./PlayerPriceReviewTestFixtures.js";
import { PlayerPriceReviewContextResolver } from "./PlayerPriceReviewContextResolver.js";
import { PlayerPriceReviewDataSource } from "./PlayerPriceReviewDataSource.js";
import { PlayerPricePerformanceCalculator } from "./PlayerPricePerformanceCalculator.js";
import { PlayerPriceRecommendationCalculator } from "./PlayerPriceRecommendationCalculator.js";

const scenario = new PlayerPriceReviewTestFixtures().createScenario();
const context = new PlayerPriceReviewContextResolver().resolveContext(scenario.calendar, scenario.now);
const original = scenario.database.matches[0];
scenario.database.matches.push({ ...original, id: "replacement", updatedAt: "2026-10-11T00:00:00Z" });
scenario.database.playerStats.push({ playerId: "player-0", matchId: "replacement", fantasyPoints: 0 });
const data = await new PlayerPriceReviewDataSource({ readDatabase: async () => scenario.database }).readReviewData(context);
assert(!data.matches.some((match) => match.id === original.id));
assert(!data.playerStats.some((stat) => stat.matchId === original.id));
const calculator = new PlayerPricePerformanceCalculator();
const performance = calculator.calculatePerformance(scenario.players[0], context, data);
assert.equal(performance.count, 10, "Real zero must count as a match");
const absent = calculator.calculatePerformance(scenario.players[1], context, data);
assert.equal(absent.count, 9, "Missing player row must not resurrect older import or count as zero");
const transferredData = { ...data, matches: data.matches.map((match, index) => index < 5 ? { ...match, league: "ВХЛ", homeTeam: "Горняк-УГМК" } : match) };
assert.equal(calculator.calculatePerformance(scenario.players[0], context, transferredData).forecast, performance.forecast, "Keep transfer history without multiplying league points again");
let requestedIds;
const optimized = await new PlayerPriceReviewDataSource({ listMatches: async () => scenario.database.matches,
  listStatsByMatchIds: async (ids) => { requestedIds = ids; return scenario.database.playerStats.filter((stat) => ids.includes(stat.matchId)); },
  readDatabase: () => assert.fail("PostgreSQL must not load full database") }).readReviewData(context);
assert.deepEqual(optimized, data);
assert(!requestedIds.includes(original.id));
scenario.database.matches.push({ ...scenario.database.matches[1], id: "live", status: "live", updatedAt: "2026-10-12T00:00:00Z" });
const liveData = await new PlayerPriceReviewDataSource({ readDatabase: async () => scenario.database }).readReviewData(context);
assert(!liveData.matches.some((match) => match.id === "live" || match.id === scenario.database.matches[1].id));
const outlierData = { ...data, playerStats: data.playerStats.map((stat) => stat.playerId === "player-2" ? { ...stat, fantasyPoints: stat.matchId.includes("-10-0") ? 1000 : 20 } : stat) };
const performances = scenario.players.map((player) => calculator.calculatePerformance(player, context, outlierData));
assert.equal(new PlayerPriceRecommendationCalculator().evaluateRecommendation(performances[2], performances).reason, "unchanged", "One exceptional game must not raise price");
console.log("Player price review data self-test passed");
