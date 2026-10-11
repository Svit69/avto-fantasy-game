import { PlayerPriceReviewMath as MathUtils } from "./PlayerPriceReviewMath.js";
import { PlayerRecentFormCalculator } from "./PlayerRecentFormCalculator.js";

export class PlayerPricePerformanceCalculator {
  calculatePerformance(player, context, data) {
    const matchTours = new Map(data.matches.map((match) => [match.id, match.tourId]));
    const matchDates = new Map(data.matches.map((match) => [match.id, Date.parse(match.scheduledAt) || 0]));
    const recentCalculator = new PlayerRecentFormCalculator();
    const uniqueStats = new Map();
    for (const stat of data.playerStats) {
      if (stat.playerId === player.id && matchTours.has(stat.matchId) && Number.isFinite(stat.fantasyPoints)) uniqueStats.set(stat.matchId, stat);
    }
    const summaries = context.tours.map((tour, index) => {
      const values = [...uniqueStats.values()].filter((stat) => matchTours.get(stat.matchId) === tour.id).map((stat) => stat.fantasyPoints);
      const limitedValues = recentCalculator.limitOutliers(values, [...uniqueStats.values()].map((stat) => stat.fantasyPoints));
      return { tour, count: values.length, mean: MathUtils.calculateMean(values), median: MathUtils.calculateMedian(values),
        robustMean: MathUtils.calculateMean(limitedValues), robustMedian: MathUtils.calculateMedian(limitedValues),
        weight: [0.6, 0.3, 0.1][index] * Math.min(values.length / 5, 1) };
    });
    const totalWeight = summaries.reduce((sum, summary) => sum + summary.weight, 0);
    const baseForecast = totalWeight ? summaries.reduce((sum, summary) => sum + summary.weight * (0.7 * summary.robustMean + 0.3 * summary.robustMedian), 0) / totalWeight : 0;
    const recentForm = recentCalculator.calculateRecentForm([...uniqueStats.values()].map((stat) => ({ matchId: stat.matchId,
      points: stat.fantasyPoints, tourId: matchTours.get(stat.matchId), playedAt: matchDates.get(stat.matchId) })), context.tours[0]?.id);
    const forecast = baseForecast + recentForm.adjustment;
    const variability = MathUtils.calculateVariability([...uniqueStats.values()].map((stat) => stat.fantasyPoints));
    return { player, summaries, forecast, recentForm, variability, stability: 1 / (1 + variability), count: uniqueStats.size, currentCount: summaries[0]?.count || 0 };
  }
}
