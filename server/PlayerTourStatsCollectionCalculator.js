import { PlayerTourStatsCalculator } from "./PlayerTourStatsCalculator.js";

export class PlayerTourStatsCollectionCalculator {
  constructor(playerStatsCalculator = new PlayerTourStatsCalculator()) {
    this.playerStatsCalculator = playerStatsCalculator;
  }

  createMonthlyPlayerStatsCollection({ month, calendar, matchDatabase }) {
    return [...this.#collectPlayerIds(matchDatabase.playerStats || [])].map((playerId) =>
      this.playerStatsCalculator.createMonthlyPlayerStats({ playerId, month, calendar, matchDatabase }));
  }

  #collectPlayerIds(playerStats) {
    return playerStats.reduce((ids, stat) => stat.playerId ? ids.add(stat.playerId) : ids, new Set());
  }
}
