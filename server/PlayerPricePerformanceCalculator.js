import { PlayerPriceReviewMath as MathUtils } from "./PlayerPriceReviewMath.js";
import { PlayerRecentFormCalculator } from "./PlayerRecentFormCalculator.js";
import { PlayerPriceWindowCalculator } from "./PlayerPriceWindowCalculator.js";

export class PlayerPricePerformanceCalculator {
  calculatePerformance(player, context, data) {
    const matchTours = new Map(data.matches.map((match) => [match.id, match.tourId]));
    const matchDates = new Map(data.matches.map((match) => [match.id, Date.parse(match.scheduledAt) || 0]));
    const recentCalculator = new PlayerRecentFormCalculator();
    const uniqueStats = new Map();
    for (const stat of data.playerStats) {
      if (stat.playerId === player.id && matchTours.has(stat.matchId) && Number.isFinite(stat.fantasyPoints)) uniqueStats.set(stat.matchId, stat);
    }
    const games = [...uniqueStats.values()].map((stat) => ({ matchId: stat.matchId, points: stat.fantasyPoints,
      tourId: matchTours.get(stat.matchId), playedAt: matchDates.get(stat.matchId) })).sort((first, second) => first.playedAt - second.playedAt || first.matchId.localeCompare(second.matchId));
    const summaries = new PlayerPriceWindowCalculator().calculateWindows(games);
    const totalWeight = summaries.reduce((sum, summary) => sum + summary.weight, 0);
    const baseForecast = totalWeight ? summaries.reduce((sum, summary) => sum + summary.weight * (0.7 * summary.robustMean + 0.3 * summary.robustMedian), 0) / totalWeight : 0;
    const recentForm = recentCalculator.calculateRecentForm(games);
    const forecast = baseForecast + recentForm.adjustment;
    const variability = MathUtils.calculateVariability(games.slice(-10).map((game) => game.points));
    return { player, summaries, forecast, recentForm, variability, stability: 1 / (1 + variability), count: uniqueStats.size,
      dataAgeDays: games.length ? Math.max(0, Math.floor((context.now.getTime() - games.at(-1).playedAt) / 86400000)) : null,
      lastPlayedAt: games.length ? new Date(games.at(-1).playedAt).toISOString().slice(0, 10) : null };
  }
}
