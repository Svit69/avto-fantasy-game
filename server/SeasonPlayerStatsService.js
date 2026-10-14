import { PlayerPriceReviewDataSource } from "./PlayerPriceReviewDataSource.js";

export class SeasonPlayerStatsService {
  constructor(repository, source = new PlayerPriceReviewDataSource(repository)) { this.source = source; }
  async createSeasonPlayerStats(calendar, now = new Date()) {
    const database = await this.source.readReviewData({ matches: calendar.matches || [], now });
    const players = new Map();
    const processed = new Set();
    for (const stat of database.playerStats) {
      const key = JSON.stringify([stat.playerId, stat.matchId]);
      if (!stat.playerId || processed.has(key)) continue;
      processed.add(key);
      const total = players.get(stat.playerId) || { playerId: stat.playerId, matches: 0, fantasyPoints: 0, goals: 0, assists: 0 };
      total.matches += 1;
      for (const field of ["fantasyPoints", "goals", "assists"]) total[field] += Number(stat[field]) || 0;
      players.set(stat.playerId, total);
    }
    return [...players.values()].map((stat) => ({ ...stat, fantasyPoints: Math.round(stat.fantasyPoints / stat.matches) }));
  }
}
