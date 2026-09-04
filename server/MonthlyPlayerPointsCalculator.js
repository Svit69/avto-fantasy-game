import { PlayerTourStatsCalculator } from "./PlayerTourStatsCalculator.js";

export class MonthlyPlayerPointsCalculator {
  constructor(playerTourStatsCalculator = new PlayerTourStatsCalculator()) {
    this.playerTourStatsCalculator = playerTourStatsCalculator;
  }

  createPlayerPointsMap(players, month, calendar, matchDatabase) {
    return new Map(players.map((player) => {
      const stats = this.playerTourStatsCalculator.createMonthlyPlayerStats({
        playerId: player.id, month, calendar, matchDatabase,
      });
      return [player.id, Number(stats.fantasyPoints || 0)];
    }));
  }
}
