import { PlayerPriceEvidencePolicy } from "./PlayerPriceEvidencePolicy.js";

export class GoalkeeperPriceEvidencePolicy extends PlayerPriceEvidencePolicy {
  hasSufficientPeers(peers) { return peers.length >= 1; }
  calculateConfidence(performance) { return super.calculateConfidence(performance) * (performance.count + 5) / (performance.count + 8); }
}
