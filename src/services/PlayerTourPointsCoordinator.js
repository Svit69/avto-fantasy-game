import { PlayerTourStatsApiClient } from "./PlayerTourStatsApiClient.js";
import { FantasyCalendarApiClient } from "./FantasyCalendarApiClient.js";
import { PlayerStatsTourResolver } from "./PlayerStatsTourResolver.js";

export class PlayerTourPointsCoordinator {
  constructor(apiClient = new PlayerTourStatsApiClient(), calendarApiClient = new FantasyCalendarApiClient(), statsTourResolver = new PlayerStatsTourResolver()) {
    Object.assign(this, { apiClient, calendarApiClient, statsTourResolver });
  }

  async applyTourPoints(players, month) {
    const calendar = await this.calendarApiClient.loadFantasyCalendar();
    const statsMonth = this.statsTourResolver.resolveStatsMonth(calendar, month);
    const stats = await this.apiClient.loadMonthlyPlayerTourStats(statsMonth);
    const statsByPlayerId = this.#createStatsMap(stats);
    players.forEach((player) => player.applyTourStats(statsByPlayerId.get(player.getId()) || this.#createEmptyStats(player, statsMonth)));
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
