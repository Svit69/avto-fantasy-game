import { PlayerPriceReviewMath as MathUtils } from "./PlayerPriceReviewMath.js";
import { PlayerPriceEvidencePolicy } from "./PlayerPriceEvidencePolicy.js";
import { GoalkeeperPriceEvidencePolicy } from "./GoalkeeperPriceEvidencePolicy.js";
import { PlayerPriceBudgetPolicy } from "./PlayerPriceBudgetPolicy.js";

export class PlayerPriceRecommendationCalculator {
  constructor(skaterPolicy = new PlayerPriceEvidencePolicy(), goalkeeperPolicy = new GoalkeeperPriceEvidencePolicy()) {
    Object.assign(this, { skaterPolicy, goalkeeperPolicy });
  }
  evaluateRecommendation(performance, performances, budget = null) {
    const policy = performance.player.position === "вратарь" ? this.goalkeeperPolicy : this.skaterPolicy;
    if (!policy.hasSufficientEvidence(performance) || !Number.isFinite(performance.player.price) || !(performance.player.price > 0)) return { reason: "insufficient" };
    const peers = performances.filter((peer) => peer.player.id !== performance.player.id && peer.player.team === performance.player.team
      && peer.player.position === performance.player.position && peer.forecast > 0 && peer.player.price > 0 && policy.hasSufficientEvidence(peer));
    if (!policy.hasSufficientPeers(peers)) return { reason: "peers" };
    const benchmark = MathUtils.calculateMedian(peers.map((peer) => peer.forecast / peer.player.price));
    const fairPrice = new PlayerPriceBudgetPolicy().calculateFairPrice(performance, Math.max(1, performance.forecast / benchmark), budget);
    const gap = (fairPrice - performance.player.price) * policy.calculateConfidence(performance);
    const direction = Math.sign(gap);
    const recentRatio = performance.summaries[0].median / performance.player.price / benchmark;
    if (Math.abs(gap) < Math.max(1.5, performance.player.price * 0.2)
      || (direction > 0 ? recentRatio < 1.1 && (performance.recentForm?.strongGames || 0) < 2 : recentRatio > 0.9 && fairPrice >= performance.player.price * 0.75)) return { reason: "unchanged" };
    const suggestedPrice = Math.max(1, performance.player.price + direction);
    if (suggestedPrice === performance.player.price) return { reason: "unchanged" };
    return { reason: "recommendation", ...performance, suggestedPrice, benchmark, gap, fairPrice, budgetLimit: budget?.limit };
  }
}
