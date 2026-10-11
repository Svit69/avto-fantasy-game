import { PlayerPriceReviewMath as MathUtils } from "./PlayerPriceReviewMath.js";

export class PlayerRecentFormCalculator {
  calculateRecentForm(games) {
    const sorted = [...games].sort((first, second) => first.playedAt - second.playedAt || first.matchId.localeCompare(second.matchId));
    const lastFive = sorted.slice(-5);
    const recent = sorted.slice(-2);
    const historical = sorted.slice(-12, -2).map((game) => game.points);
    const baseline = MathUtils.calculateMedian(historical.length ? historical : sorted.map((game) => game.points));
    const threshold = baseline + Math.max(10, Math.abs(baseline) * 0.5);
    const strongGames = recent.filter((game) => game.points >= threshold).length;
    const recentMean = MathUtils.calculateMean(recent.map((game) => game.points));
    const weight = strongGames >= 2 ? 0.5 : strongGames === 1 ? 0.15 : 0;
    const adjustment = weight * Math.min(Math.max(0, recentMean - baseline), Math.max(15, Math.abs(baseline) * 0.75));
    const positiveRate = lastFive.length ? lastFive.filter((game) => game.points > 0).length / lastFive.length : 0;
    const consistent = lastFive.length >= 3 && positiveRate >= 0.8 && MathUtils.calculateVariability(lastFive.map((game) => game.points)) <= 0.35;
    return { recentPoints: recent.map((game) => game.points), baseline, strongGames, adjustment, positiveRate,
      signal: consistent ? "consistent" : strongGames >= 2 ? "two_game_surge" : strongGames === 1 ? "one_game_surge" : "regular" };
  }
  limitOutliers(values, history = values) {
    const median = MathUtils.calculateMedian(history);
    const allowance = Math.max(15, Math.abs(median));
    return values.map((value) => Math.max(median - allowance, Math.min(median + allowance, value)));
  }
}
