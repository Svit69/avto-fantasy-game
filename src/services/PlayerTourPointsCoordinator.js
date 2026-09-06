import { PlayerTourStatsApiClient } from "./PlayerTourStatsApiClient.js";

export class PlayerTourPointsCoordinator {
  constructor(apiClient = new PlayerTourStatsApiClient()) { this.apiClient = apiClient; }

  async applyTourPoints(players, month) {
    const stats = await this.apiClient.loadMonthlyPlayerTourStats(month);
    const statsByPlayerId = this.#createStatsMap(stats);
    players.forEach((player) => player.applyTourStats(statsByPlayerId.get(player.getId()) || this.#createEmptyStats(player, month)));
    return stats;
  }

  connectMonthTourPointsLoading(rootElement, players, rosterDomRenderer, getSelectedMonth) {
    rootElement.querySelector(".month-select")?.addEventListener("change", async () => {
      await this.applyTourPoints(players, getSelectedMonth());
      rosterDomRenderer.renderRosterSections();
    });
  }

  #createStatsMap(stats) {
    return new Map(stats.map((stat) => [stat.playerId, stat]));
  }

  #createEmptyStats(player, month) {
    return this.apiClient.createEmptyStats(player.getId(), month);
  }
}
