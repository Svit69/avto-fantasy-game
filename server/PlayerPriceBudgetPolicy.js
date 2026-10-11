import { FANTASY_ROSTER_RULES } from "../src/config/FantasyRosterRules.js";
import { PriceReviewRosterOptimizer } from "./PriceReviewRosterOptimizer.js";
import { PlayerPriceAffordabilityPlanner } from "./PlayerPriceAffordabilityPlanner.js";

export class PlayerPriceBudgetPolicy {
  #optimizer;
  constructor(rules = FANTASY_ROSTER_RULES) { this.rules = rules; this.#optimizer = new PriceReviewRosterOptimizer(rules); }
  createBudgetContext(performances, players = performances.map((item) => item.player)) {
    const rated = performances.filter((item) => item.forecast > 0 && item.count >= 3);
    const reference = this.#optimizer.findOptimalRoster(rated.map((item) => ({ ...item.player, forecast: item.forecast })), (player) => player.forecast);
    return { limit: this.rules.budgetLimit, clubLimit: this.rules.clubPlayerLimit,
      referencePoints: reference?.value || null, minimumBefore: this.#optimizer.findOptimalRoster(players)?.cost ?? null };
  }
  calculateFairPrice(performance, peerFairPrice, budget) {
    if (!budget?.referencePoints) return peerFairPrice;
    const budgetFairPrice = budget.limit * Math.max(0, performance.forecast) / budget.referencePoints;
    return Math.max(1, 0.6 * peerFairPrice + 0.4 * budgetFairPrice);
  }
  protectAffordability(evaluations, performances, budget) {
    return new PlayerPriceAffordabilityPlanner(this.#optimizer).planAffordableChanges(evaluations, performances, budget);
  }
}
