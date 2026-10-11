import { PlayerPriceEvidencePolicy } from "./PlayerPriceEvidencePolicy.js";
import { GoalkeeperPriceEvidencePolicy } from "./GoalkeeperPriceEvidencePolicy.js";
import { PlayerPriceBudgetPolicy } from "./PlayerPriceBudgetPolicy.js";
import { PlayerPricePeerBenchmark } from "./PlayerPricePeerBenchmark.js";
import { PlayerPriceDecisionFormatter } from "./PlayerPriceDecisionFormatter.js";

export class PlayerPriceRecommendationCalculator {
  constructor(skaterPolicy = new PlayerPriceEvidencePolicy(), goalkeeperPolicy = new GoalkeeperPriceEvidencePolicy()) {
    Object.assign(this, { skaterPolicy, goalkeeperPolicy });
  }
  evaluateRecommendation(performance, performances, budget = null) {
    const policy = performance.player.position === "вратарь" ? this.goalkeeperPolicy : this.skaterPolicy;
    if (!policy.hasSufficientEvidence(performance) || !Number.isFinite(performance.player.price) || !(performance.player.price > 0)) return { reason: "insufficient" };
    const comparison = new PlayerPricePeerBenchmark().calculateBenchmark(performance, performances, policy);
    if (!comparison) return { reason: "peers" };
    const benchmark = comparison.value;
    const fairPrice = new PlayerPriceBudgetPolicy().calculateFairPrice(performance, Math.max(1, performance.forecast / benchmark), budget);
    const confidence = policy.calculateConfidence(performance) * comparison.reliability;
    const gap = (fairPrice - performance.player.price) * confidence;
    const direction = Math.sign(gap);
    const recentRatio = performance.summaries[0].median / performance.player.price / benchmark;
    const diagnostics = { confidence, peerCount: comparison.peerCount, benchmark, fairPrice, gap, targetPrice: Math.max(1, performance.player.price + gap) };
    if (Math.abs(gap) < Math.max(0.75, performance.player.price * 0.12)) return { reason: "unchanged", ...diagnostics, decision: "Отклонение меньше порога изменения цены" };
    if (direction > 0 ? recentRatio < 1.1 && (performance.recentForm?.strongGames || 0) < 2 : recentRatio > 0.9 && fairPrice >= performance.player.price * 0.75) {
      return { reason: "unchanged", ...diagnostics, decision: "Нет достаточного подтверждения по форме" };
    }
    const suggestedPrice = Math.max(1, performance.player.price + direction);
    if (suggestedPrice === performance.player.price) return { reason: "unchanged", ...diagnostics, decision: "Цена уже минимальна" };
    const decision = new PlayerPriceDecisionFormatter().describeDecision(performance, direction, recentRatio, fairPrice);
    return { reason: "recommendation", ...performance, ...diagnostics, suggestedPrice, budgetLimit: budget?.limit, decision };
  }
}
