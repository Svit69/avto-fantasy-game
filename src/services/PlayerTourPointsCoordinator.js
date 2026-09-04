import { PlayerTourStatsApiClient } from "./PlayerTourStatsApiClient.js";

export class PlayerTourPointsCoordinator {
  constructor(apiClient = new PlayerTourStatsApiClient()) { this.apiClient = apiClient; }

  async applyTourPoints(players, month) {
    const stats = await Promise.all(players.map((player) => this.#loadPlayerStats(player, month)));
    stats.forEach((stat, index) => players[index].applyTourStats(stat));
    return stats;
  }

  connectMonthTourPointsLoading(rootElement, players, rosterDomRenderer, getSelectedMonth) {
    rootElement.querySelector(".month-select")?.addEventListener("change", async () => {
      await this.applyTourPoints(players, getSelectedMonth());
      rosterDomRenderer.renderRosterSections();
    });
  }

  async #loadPlayerStats(player, month) {
    return this.apiClient.loadPlayerTourStats(player.getId(), month);
  }
}
