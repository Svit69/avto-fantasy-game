import assert from "node:assert/strict";
import { PlayerPriceReviewTestFixtures } from "./PlayerPriceReviewTestFixtures.js";
import { PlayerPriceReviewContextResolver } from "./PlayerPriceReviewContextResolver.js";
import { PlayerPriceReviewMatchSelector } from "./PlayerPriceReviewMatchSelector.js";
import { PlayerPricePerformanceCalculator } from "./PlayerPricePerformanceCalculator.js";
import { PlayerPriceRecommendationCalculator } from "./PlayerPriceRecommendationCalculator.js";

const scenario = new PlayerPriceReviewTestFixtures().createScenario();
const context = new PlayerPriceReviewContextResolver().resolveContext(scenario.calendar, scenario.now);
const matches = new PlayerPriceReviewMatchSelector().selectFinishedMatches(scenario.database.matches, context);
const calculator = new PlayerPricePerformanceCalculator();
function calculateSurgePerformances(surgeCount, currentCount = 5) {
  const playerStats = scenario.database.playerStats.filter((stat) => !stat.matchId.includes("-10-") || Number(stat.matchId.at(-1)) >= 5 - currentCount)
    .map((stat) => stat.playerId === "player-2" && stat.matchId.includes("-10-") && Number(stat.matchId.at(-1)) >= 5 - surgeCount
      ? { ...stat, fantasyPoints: 1000 } : stat).reverse();
  return scenario.players.map((player) => calculator.calculatePerformance(player, context, { matches, playerStats }));
}
const regular = calculateSurgePerformances(0);
const one = calculateSurgePerformances(1);
const two = calculateSurgePerformances(2);
assert.equal(one[2].recentForm.signal, "one_game_surge");
assert.equal(two[2].recentForm.signal, "two_game_surge");
assert.deepEqual(one[2].recentForm.recentPoints, [20, 1000], "Order by match date, not database row order");
assert(one[2].forecast > regular[2].forecast && two[2].forecast > one[2].forecast);
assert.equal(one[2].summaries[0].mean, 216, "Display real average, not winsorized average");
assert(one[2].forecast < 35, "Extreme single game must have bounded impact");
const evaluator = new PlayerPriceRecommendationCalculator();
assert.equal(evaluator.evaluateRecommendation(one[2], one).reason, "unchanged");
assert.equal(evaluator.evaluateRecommendation(two[2], two).suggestedPrice, 11);
assert.equal(regular[0].recentForm.signal, "consistent");
assert(regular[0].stability > two[2].stability && regular[0].forecast > two[2].forecast);
const earlyOne = calculateSurgePerformances(1, 1);
const earlyTwo = calculateSurgePerformances(2, 2);
assert.notEqual(evaluator.evaluateRecommendation(earlyOne[2], earlyOne).reason, "insufficient");
assert.equal(evaluator.evaluateRecommendation(earlyTwo[2], earlyTwo).suggestedPrice, 11);
console.log("Player price review recent form self-test passed");
