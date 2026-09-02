export class PlayerSelectionStatsApiClient {
  async loadMonthlySelectionStats(month) {
    const response = await fetch(`/api/player-selection-stats?month=${encodeURIComponent(month)}`, {
      headers: { "x-telegram-init-data": this.#getTelegramInitData() },
    });
    if (!response.ok) return { month, totalManagers: 0, players: {} };
    return (await response.json()).stats;
  }

  #getTelegramInitData() { return window.Telegram?.WebApp?.initData || ""; }
}
