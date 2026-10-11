export class PlayerPriceEvidencePolicy {
  hasSufficientEvidence(performance) { return performance.count >= 3; }
  hasSufficientPeers(peers) { return peers.length >= 3; }
  calculateSampleSize(performance) { return Math.min(10, performance.count); }
  calculateConfidence(performance) {
    const sampleSize = this.calculateSampleSize(performance);
    const freshness = Math.max(0.5, 1 - Math.max(0, (performance.dataAgeDays || 0) - 21) / 120);
    return sampleSize / (sampleSize + 5) * (0.5 + 0.5 * performance.stability) * freshness;
  }
}
