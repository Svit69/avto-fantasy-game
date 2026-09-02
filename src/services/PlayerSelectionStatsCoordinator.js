import { PlayerSelectionStatsApiClient } from "./PlayerSelectionStatsApiClient.js";

export class PlayerSelectionStatsCoordinator {
  constructor(apiClient = new PlayerSelectionStatsApiClient()) { this.apiClient = apiClient; }

  async applySelectionStats(players, month) {
    const stats = await this.apiClient.loadMonthlySelectionStats(month);
    players.forEach((player) => player.applySelectionStats(stats.players[player.getId()]));
    return stats;
  }

  connectMonthSelectionStatsLoading(rootElement, players, getSelectedMonth) {
    rootElement.querySelector(".month-select")?.addEventListener("change", () => this.applySelectionStats(players, getSelectedMonth()));
  }
}
