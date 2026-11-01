import { VhlMatchIdentityGuard } from "./VhlMatchIdentityGuard.js";
import { VhlMatchReviewPolicy } from "./VhlMatchReviewPolicy.js";
import { VhlMatchReviewRepository } from "./VhlMatchReviewRepository.js";

export class VhlReviewedMatchIdentityGuard extends VhlMatchIdentityGuard {
  constructor(repository = new VhlMatchReviewRepository(), policy = new VhlMatchReviewPolicy()) {
    super(); Object.assign(this, { repository, policy });
  }
  async validate(source, expected) {
    try { super.validate(source, expected); }
    catch (error) {
      if (error.message !== "vhl_match_identity_mismatch") throw error;
      const proposal = this.policy.createProposal({ ...expected, onlineGameId: expected?.onlineGameId || expected?.onlineProtocolId || source.gameId }, source);
      const review = proposal && await this.repository.findReview(proposal.id);
      if (!this.repository.isCurrent(review) || review.status !== "approved") throw error;
    }
  }
}
