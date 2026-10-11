import { PlayerPriceReviewMath as MathUtils } from "./PlayerPriceReviewMath.js";
import { PlayerRecentFormCalculator } from "./PlayerRecentFormCalculator.js";

export class PlayerPriceWindowCalculator {
  calculateWindows(games) {
    const definitions = [{ title: "Последние 5", limit: 5, weight: 0.5 },
      { title: "Последние 10", limit: 10, weight: 0.3 }, { title: "Сезон", limit: games.length || 1, confidenceTarget: 10, weight: 0.2 }];
    return definitions.map((definition) => {
      const values = games.slice(-definition.limit).map((game) => game.points);
      const limited = new PlayerRecentFormCalculator().limitOutliers(values);
      return { ...definition, count: values.length, mean: MathUtils.calculateMean(values), median: MathUtils.calculateMedian(values),
        robustMean: MathUtils.calculateMean(limited), robustMedian: MathUtils.calculateMedian(limited),
        weight: definition.weight * Math.min(values.length / (definition.confidenceTarget || definition.limit), 1) };
    });
  }
}
