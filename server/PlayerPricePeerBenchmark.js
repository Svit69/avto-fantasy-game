import { PlayerPriceReviewMath as MathUtils } from "./PlayerPriceReviewMath.js";

export class PlayerPricePeerBenchmark {
  calculateBenchmark(performance, performances, policy) {
    const peers = performances.filter((peer) => peer.player.id !== performance.player.id && peer.player.team === performance.player.team
      && peer.player.position === performance.player.position && Number.isFinite(peer.forecast) && peer.forecast > 0
      && Number.isFinite(peer.player.price) && peer.player.price > 0 && policy.hasSufficientEvidence(peer));
    if (!policy.hasSufficientPeers(peers)) return null;
    const entries = peers.map((peer) => ({ value: peer.forecast / peer.player.price, weight: policy.calculateConfidence(peer) }));
    const value = MathUtils.calculateWeightedMedian(entries);
    if (!Number.isFinite(value) || value <= 0) return null;
    const dispersion = MathUtils.calculateMedian(entries.map((entry) => Math.abs(entry.value - value))) / value;
    const quality = MathUtils.calculateMedian(entries.map((entry) => entry.weight));
    return { value, peerCount: peers.length, reliability: (0.85 + 0.15 * quality) / (1 + Math.min(2, dispersion) * 0.1) };
  }
}
