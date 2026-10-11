import { PlayerPriceEvidencePolicy } from "./PlayerPriceEvidencePolicy.js";

export class GoalkeeperPriceEvidencePolicy extends PlayerPriceEvidencePolicy {
  hasSufficientEvidence(performance) { return performance.currentCount >= 2 && performance.count >= 8; }
  hasSufficientPeers(peers) { return peers.length >= 1; }
}
