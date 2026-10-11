import { PlayerPriceReviewMath as MathUtils } from "./PlayerPriceReviewMath.js";

export class PlayerRecentFormCalculator {
  calculateRecentForm(games, currentTourId) {
    const sorted = [...games].sort((first, second) => first.playedAt - second.playedAt || first.matchId.localeCompare(second.matchId));
    const current = sorted.filter((game) => game.tourId === currentTourId);
    const recent = current.slice(-2);
    const recentIds = new Set(recent.map((game) => game.matchId));
    const historical = sorted.filter((game) => !recentIds.has(game.matchId)).map((game) => game.points);
    const baseline = MathUtils.calculateMedian(historical.length ? historical : sorted.map((game) => game.points));
    const threshold = baseline + Math.max(10, Math.abs(baseline) * 0.5);
    const strongGames = recent.filter((game) => game.points >= threshold).length;
    const recentMean = MathUtils.calculateMean(recent.map((game) => game.points));
    const weight = strongGames >= 2 ? 0.5 : strongGames === 1 ? 0.15 : 0;
    const adjustment = weight * Math.min(Math.max(0, recentMean - baseline), Math.max(15, Math.abs(baseline) * 0.75));
    const positiveRate = current.length ? current.filter((game) => game.points > 0).length / current.length : 0;
    const consistent = current.length >= 3 && positiveRate >= 0.8 && MathUtils.calculateVariability(current.map((game) => game.points)) <= 0.35;
    return { recentPoints: recent.map((game) => game.points), baseline, strongGames, adjustment, positiveRate,
      signal: consistent ? "consistent" : strongGames >= 2 ? "two_game_surge" : strongGames === 1 ? "one_game_surge" : "regular" };
  }
  limitOutliers(values, history = values) {
    const median = MathUtils.calculateMedian(history);
    const allowance = Math.max(15, Math.abs(median));
    return values.map((value) => Math.max(median - allowance, Math.min(median + allowance, value)));
  }
}
