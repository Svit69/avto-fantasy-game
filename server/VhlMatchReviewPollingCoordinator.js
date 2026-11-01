import { VhlMatchReviewRepository } from "./VhlMatchReviewRepository.js";
import { VhlMatchReviewPolicy } from "./VhlMatchReviewPolicy.js";
import { VhlOnlineProtocolIdResolver } from "./VhlOnlineProtocolIdResolver.js";

export class VhlMatchReviewPollingCoordinator {
  constructor(repository = new VhlMatchReviewRepository(), policy = new VhlMatchReviewPolicy()) {
    Object.assign(this, { repository, policy });
  }
  async findPollableMatches(calendar, selector, now = Date.now()) {
    const matches = new Map(selector.findActiveMatches(calendar, now).map((match) => [match.id, match]));
    const reviews = await this.repository.listReviews();
    for (const review of reviews) {
      if (review.status !== "approved" || review.collectedAt || !this.repository.isCurrent(review)) continue;
      const match = calendar.matches.find((item) => item.id === review.expected.id);
      if (!match || match.league !== "ВХЛ" || match.featuredTeam !== "Горняк-УГМК" || Date.parse(match.startsAt) > now) continue;
      const onlineGameId = new VhlOnlineProtocolIdResolver().resolveOnlineGameId(match);
      if (!this.policy.matchesCalendar(review, { ...match, onlineGameId }) || matches.has(match.id)) continue;
      matches.set(match.id, { ...match, onlineGameId, isLivePollingWindow: false });
    }
    return [...matches.values()];
  }
  markCollected(match) { return this.repository.markCollected(match); }
}
