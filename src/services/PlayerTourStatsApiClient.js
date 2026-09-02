export class PlayerTourStatsApiClient {
  async loadPlayerTourStats(playerId, month) {
    try {
      const query = `playerId=${encodeURIComponent(playerId)}&month=${encodeURIComponent(month)}&stamp=${Date.now()}`;
      const response = await fetch(`/api/player-tour-stats?${query}`, { cache: "no-store" });
      if (!response.ok) return this.#createEmptyStats(playerId, month);
      const payload = await response.json();
      return payload.stats || this.#createEmptyStats(playerId, month);
    } catch {
      return this.#createEmptyStats(playerId, month);
    }
  }

  #createEmptyStats(playerId, month) {
    return { playerId, month, matches: 0, goals: 0, assists: 0, penalties: 0, shotsOnGoal: 0,
      blockedShots: 0, hits: 0, takeaways: 0, interceptions: 0, saves: 0, goalsAgainst: 0, fantasyPoints: 0 };
  }
}
