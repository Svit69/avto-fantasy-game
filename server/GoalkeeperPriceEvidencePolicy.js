import { PlayerPriceEvidencePolicy } from "./PlayerPriceEvidencePolicy.js";

export class GoalkeeperPriceEvidencePolicy extends PlayerPriceEvidencePolicy {
  hasSufficientPeers(peers) { return peers.length >= 1; }
  calculateConfidence(performance) {
    const sampleSize = this.calculateSampleSize(performance);
    return super.calculateConfidence(performance) * (sampleSize + 5) / (sampleSize + 8);
  }
}
