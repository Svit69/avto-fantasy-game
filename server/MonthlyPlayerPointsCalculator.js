import { MonthlyPlayerStatIndex } from "./MonthlyPlayerStatIndex.js";

export class MonthlyPlayerPointsCalculator {
  constructor(index = new MonthlyPlayerStatIndex()) { this.index = index; }

  createPlayerPointsMap(players, month, calendar, matchDatabase) {
    const selected = this.index.createIndex(month, calendar, matchDatabase);
    return new Map(players.map((player) => {
      const stats = [...(selected.get(player.id)?.values() || [])];
      const total = stats.reduce((sum, entry) => sum + Number(entry.stat.fantasyPoints || 0), 0);
      const average = stats.length ? Math.round(total / stats.length) : 0;
      return [player.id, Number(average || 0)];
    }));
  }
}
