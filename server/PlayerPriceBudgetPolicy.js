import { FANTASY_ROSTER_RULES } from "../src/config/FantasyRosterRules.js";
import { PriceReviewRosterOptimizer } from "./PriceReviewRosterOptimizer.js";

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
    const proposals = new Map(evaluations.filter((item) => item.reason === "recommendation").map((item) => [item.player.id, item.suggestedPrice]));
    const proposedPlayers = performances.map((item) => ({ ...item.player, price: proposals.get(item.player.id) ?? item.player.price }));
    const cheapest = this.#optimizer.findOptimalRoster(proposedPlayers);
    const protectedEvaluations = evaluations.map((item) => {
      if (item.reason !== "recommendation" || item.suggestedPrice <= item.player.price) return item;
      const completion = cheapest && cheapest.cost <= budget.limit ? this.#optimizer.findOptimalRoster(proposedPlayers, undefined, item.player.id) : null;
      return completion && completion.cost <= budget.limit ? { ...item, minimumRosterCost: completion.cost } : { reason: "budget" };
    });
    const accepted = new Map(protectedEvaluations.filter((item) => item.reason === "recommendation").map((item) => [item.player.id, item.suggestedPrice]));
    const finalPlayers = performances.map((item) => ({ ...item.player, price: accepted.get(item.player.id) ?? item.player.price }));
    return { evaluations: protectedEvaluations, budget: { ...budget, minimumAfter: this.#optimizer.findOptimalRoster(finalPlayers)?.cost ?? null } };
  }
}
