import { MonthlyImportedMatchSelector } from "./MonthlyImportedMatchSelector.js";

export class KhlMatchDataQueryService {
  constructor(repository, monthlyMatchSelector = new MonthlyImportedMatchSelector()) {
    Object.assign(this, { repository, monthlyMatchSelector });
  }

  async readMonthlyMatchStats(month, calendar) {
    if (this.repository.listMatches && this.repository.listStatsByMatchIds) return this.#readOptimizedMonthlyMatchStats(month, calendar);
    const matchDatabase = await this.repository.readDatabase();
    const matches = this.#selectMonthMatches(month, calendar, matchDatabase.matches || []);
    const matchIds = new Set(matches.map((match) => match.id));
    return { matches, playerStats: (matchDatabase.playerStats || []).filter((stat) => matchIds.has(stat.matchId)) };
  }

  async #readOptimizedMonthlyMatchStats(month, calendar) {
    const matches = this.#selectMonthMatches(month, calendar, await this.repository.listMatches());
    return { matches, playerStats: await this.repository.listStatsByMatchIds(matches.map((match) => match.id)) };
  }

  #selectMonthMatches(month, calendar, importedMatches) {
    return this.monthlyMatchSelector.selectLatestMonthMatches(month, calendar, importedMatches);
  }
}
