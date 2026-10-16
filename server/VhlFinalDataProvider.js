import { VhlReportDataProvider } from "./VhlReportDataProvider.js";
import { VhlOnlineDataProvider } from "./VhlOnlineDataProvider.js";
export class VhlFinalDataProvider {
  constructor({ onlineGameId, players, identity, logger, reportProvider, onlineProvider }) {
    Object.assign(this, { onlineGameId, logger,
      reportProvider: reportProvider || new VhlReportDataProvider({ source: { gameId: onlineGameId, url: `https://vhlru.ru/report/1430/?idgame=${onlineGameId}` }, players, identity }),
      onlineProvider: onlineProvider || new VhlOnlineDataProvider({ onlineGameId, players, identity }) });
  }
  async getMatch() {
    if (this.match) return this.match;
    try {
      this.match = await this.reportProvider.getMatch();
      this.selectedProvider = this.reportProvider;
    } catch (error) {
      if (!this.#canUseOnlineFallback(error)) throw error;
      this.logger?.warn("vhl_final_online_fallback", { onlineGameId: this.onlineGameId, reason: error.message });
      this.match = await this.onlineProvider.getMatch();
      this.selectedProvider = this.onlineProvider;
    }
    return this.match;
  }
  async getPlayByPlay() {
    await this.getMatch();
    return this.selectedProvider.getPlayByPlay();
  }
  #canUseOnlineFallback(error) {
    return ["vhl_report_match_not_found", "fetch failed", "vhl_online_game_not_found"].includes(error.message)
      || /^vhl_online_http_(?:404|429|5\d\d)$/.test(error.message)
      || ["AbortError", "TimeoutError"].includes(error.name);
  }
}
