export class StandingsApiClient {
  async loadMonthlyStandings(month) {
    const response = await fetch(`/api/standings?month=${encodeURIComponent(month)}`, {
      headers: { "x-telegram-init-data": this.#getTelegramInitData() },
    });
    if (!response.ok) throw new Error("standings_load_failed");
    return (await response.json()).standings;
  }

  #getTelegramInitData() { return window.Telegram?.WebApp?.initData || ""; }
}
