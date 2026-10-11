import { PlayerPriceReviewContextResolver } from "./PlayerPriceReviewContextResolver.js";
import { PlayerPriceReviewDataSource } from "./PlayerPriceReviewDataSource.js";
import { PlayerPricePerformanceCalculator } from "./PlayerPricePerformanceCalculator.js";
import { PlayerPriceRecommendationCalculator } from "./PlayerPriceRecommendationCalculator.js";
import { PriceReviewCoverageCalculator } from "./PriceReviewCoverageCalculator.js";

export class PlayerPriceReviewService {
  constructor({ playerCatalogRepository, calendarRepository, matchDataRepository, clock = () => new Date() }) {
    Object.assign(this, { playerCatalogRepository, calendarRepository, clock });
    this.dataSource = new PlayerPriceReviewDataSource(matchDataRepository);
  }
  async createReviewReport() {
    const context = new PlayerPriceReviewContextResolver().resolveContext(await this.calendarRepository.listCalendar(), this.clock());
    const players = (await this.playerCatalogRepository.listPlayers()).filter((player) => player.status !== "left_game");
    const data = await this.dataSource.readReviewData(context);
    const calculator = new PlayerPricePerformanceCalculator();
    const performances = players.map((player) => calculator.calculatePerformance(player, context, data));
    const coverage = [...new Set(players.map((player) => player.team))].map((team) => new PriceReviewCoverageCalculator().calculateTeamCoverage(team, context, data));
    const unavailableTeams = new Set(coverage.filter((item) => !item.sufficient).map((item) => item.team));
    const evaluator = new PlayerPriceRecommendationCalculator();
    const evaluations = performances.map((performance) => unavailableTeams.has(performance.player.team)
      ? { reason: "coverage" } : evaluator.evaluateRecommendation(performance, performances));
    const recommendations = evaluations.filter((item) => item.reason === "recommendation").sort((first, second) => Math.abs(second.gap) - Math.abs(first.gap));
    const counts = evaluations.reduce((result, item) => ({ ...result, [item.reason]: (result[item.reason] || 0) + 1 }), {});
    return { tours: context.tours, recommendations, coverage, counts, total: players.length };
  }
}
