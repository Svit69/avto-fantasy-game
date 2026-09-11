import { MonthlyImportedMatchSelector } from "./MonthlyImportedMatchSelector.js";
import { PlayerMatchStatsCalculator } from "./PlayerMatchStatsCalculator.js";

export class PlayerTourStatsCalculator {
  constructor(matchSelector = new MonthlyImportedMatchSelector(), matchStatsCalculator = new PlayerMatchStatsCalculator(matchSelector)) {
    Object.assign(this, { matchSelector, matchStatsCalculator });
  }

  createMonthlyPlayerStats({ playerId, month, calendar, matchDatabase }) {
    const matches = this.#findMonthImportedMatches(month, calendar, matchDatabase.matches || []);
    const playerStats = this.#findPlayerStats(playerId, matches, matchDatabase.playerStats || []);
    return { playerId, month, ...this.#sumPlayerStats(playerStats), matches: playerStats.length,
      matchStats: this.matchStatsCalculator.createPlayerMatchStats({ playerId, month, calendar, matchDatabase }) };
  }

  #findMonthImportedMatches(month, calendar, importedMatches) {
    return this.matchSelector.selectLatestMonthMatches(month, calendar, importedMatches);
  }

  #findPlayerStats(playerId, matches, playerStats) {
    const matchIds = new Set(matches.map((match) => match.id));
    return playerStats.filter((stat) => stat.playerId === playerId && matchIds.has(stat.matchId));
  }

  #sumPlayerStats(stats) {
    const totals = this.#statFields().reduce((sum, field) => ({ ...sum, [field]: this.#sumStatsField(stats, field) }), {});
    return { ...totals, fantasyPoints: this.#calculateAverageFantasyPoints(totals.fantasyPoints, stats.length) };
  }

  #sumStatsField(stats, field) {
    return stats.reduce((total, stat) => total + Number(stat[field] || 0), 0);
  }

  #calculateAverageFantasyPoints(totalFantasyPoints, matchesCount) {
    return matchesCount ? Math.round(totalFantasyPoints / matchesCount) : 0;
  }

  #statFields() {
    return ["goals", "assists", "penalties", "shotsOnGoal", "blockedShots", "hits", "takeaways", "interceptions", "saves", "goalsAgainst", "fantasyPoints"];
  }
}
