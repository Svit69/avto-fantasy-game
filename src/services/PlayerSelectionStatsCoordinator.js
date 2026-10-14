import { PlayerSelectionStatsApiClient } from "./PlayerSelectionStatsApiClient.js";

export class PlayerSelectionStatsCoordinator {
  #revision = 0;
  constructor(apiClient = new PlayerSelectionStatsApiClient()) { this.apiClient = apiClient; }

  async applySelectionStats(players, month) {
    const revision = ++this.#revision;
    const stats = await this.apiClient.loadMonthlySelectionStats(month);
    if (revision !== this.#revision) return stats;
    players.forEach((player) => player.applySelectionStats(stats.players[player.getId()]));
    return stats;
  }

  connectMonthSelectionStatsLoading(rootElement, players, getSelectedMonth) {
    rootElement.querySelector(".month-select")?.addEventListener("change", async () => {
      await this.applySelectionStats(players, getSelectedMonth());
      rootElement.dispatchEvent(new Event("player-market-stats-updated"));
    });
  }
}
