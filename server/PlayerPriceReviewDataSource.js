import { PlayerPriceReviewMatchSelector } from "./PlayerPriceReviewMatchSelector.js";

export class PlayerPriceReviewDataSource {
  constructor(repository, selector = new PlayerPriceReviewMatchSelector()) { Object.assign(this, { repository, selector }); }
  async readReviewData(context) {
    if (this.repository.listMatches && this.repository.listStatsByMatchIds) {
      const matches = this.selector.selectFinishedMatches(await this.repository.listMatches(), context);
      const playerStats = matches.length ? await this.repository.listStatsByMatchIds(matches.map((match) => match.id)) : [];
      return { matches, playerStats };
    }
    const database = await this.repository.readDatabase();
    const matches = this.selector.selectFinishedMatches(database.matches || [], context);
    const matchIds = new Set(matches.map((match) => match.id));
    return { matches, playerStats: (database.playerStats || []).filter((stat) => matchIds.has(stat.matchId)) };
  }
}
