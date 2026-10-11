import { PlayerPriceReviewContextResolver } from "./PlayerPriceReviewContextResolver.js";
import { PlayerPriceReviewDataSource } from "./PlayerPriceReviewDataSource.js";
import { PlayerPricePerformanceCalculator } from "./PlayerPricePerformanceCalculator.js";
import { PlayerPriceRecommendationCalculator } from "./PlayerPriceRecommendationCalculator.js";
import { PriceReviewCoverageCalculator } from "./PriceReviewCoverageCalculator.js";
import { PlayerPriceBudgetPolicy } from "./PlayerPriceBudgetPolicy.js";

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
    const budgetPolicy = new PlayerPriceBudgetPolicy();
    const budgetContext = budgetPolicy.createBudgetContext(performances.filter((item) => !unavailableTeams.has(item.player.team)), players);
    const evaluator = new PlayerPriceRecommendationCalculator();
    const evaluations = performances.map((performance) => unavailableTeams.has(performance.player.team)
      ? { reason: "coverage" } : evaluator.evaluateRecommendation(performance, performances, budgetContext));
    const protectedReport = budgetPolicy.protectAffordability(evaluations, performances, budgetContext);
    const recommendations = protectedReport.evaluations.filter((item) => item.reason === "recommendation").sort((first, second) => Math.abs(second.gap) - Math.abs(first.gap));
    const counts = protectedReport.evaluations.reduce((result, item) => ({ ...result, [item.reason]: (result[item.reason] || 0) + 1 }), {});
    counts.no_data = performances.filter((item) => !item.count).length;
    counts.short_history = performances.filter((item) => item.count > 0 && item.count < 3).length;
    const playerAssessments = performances.map((performance, index) => ({ ...performance, reason: protectedReport.evaluations[index].reason }));
    return { tours: context.tours, season: context.season, recommendations, coverage, counts, total: players.length, budget: protectedReport.budget, playerAssessments };
  }
}
