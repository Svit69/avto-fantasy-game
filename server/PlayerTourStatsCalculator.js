import { MonthlyPlayerMatchStatSelector } from "./MonthlyPlayerMatchStatSelector.js";
import { PlayerMatchStatsCalculator } from "./PlayerMatchStatsCalculator.js";

export class PlayerTourStatsCalculator {
  constructor(playerStatSelector = new MonthlyPlayerMatchStatSelector(), matchStatsCalculator = new PlayerMatchStatsCalculator(playerStatSelector)) {
    Object.assign(this, { playerStatSelector, matchStatsCalculator });
  }

  createMonthlyPlayerStats({ playerId, month, calendar, matchDatabase }) {
    const playerStats = this.playerStatSelector.selectPlayerMatchStats({ playerId, month, calendar, matchDatabase }).map(({ stat }) => stat);
    return { playerId, month, ...this.#sumPlayerStats(playerStats), matches: playerStats.length,
      matchStats: this.matchStatsCalculator.createPlayerMatchStats({ playerId, month, calendar, matchDatabase }) };
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
