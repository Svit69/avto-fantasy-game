export class PlayerPriceEvidencePolicy {
  hasSufficientEvidence(performance) { return performance.currentCount >= 1 && performance.count >= 5; }
  hasSufficientPeers(peers) { return peers.length >= 3; }
  calculateConfidence(performance) { return performance.count / (performance.count + 5) * (0.5 + 0.5 * performance.stability); }
}
