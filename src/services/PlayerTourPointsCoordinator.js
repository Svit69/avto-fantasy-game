import { PlayerTourStatsApiClient } from "./PlayerTourStatsApiClient.js";
import { FantasyCalendarApiClient } from "./FantasyCalendarApiClient.js";
import { PlayerStatsTourResolver } from "./PlayerStatsTourResolver.js";
import { PlayerMarketStatsStore } from "./PlayerMarketStatsStore.js";

export class PlayerTourPointsCoordinator {
  #revision = 0;
  constructor(apiClient = new PlayerTourStatsApiClient(), calendarApiClient = new FantasyCalendarApiClient(), statsTourResolver = new PlayerStatsTourResolver()) {
    Object.assign(this, { apiClient, calendarApiClient, statsTourResolver });
  }

  async applyTourPoints(players, month) {
    const revision = ++this.#revision;
    const calendar = await this.calendarApiClient.loadFantasyCalendar();
    const statsMonth = this.statsTourResolver.resolveStatsMonth(calendar, month);
    const tour = calendar.tours?.find((item) => item.month === month);
    const isUpcoming = Date.parse(tour?.deadlineAt || tour?.startsAt) > Date.now();
    const [stats, marketStats] = await Promise.all([this.apiClient.loadMonthlyPlayerTourStats(statsMonth),
      isUpcoming ? this.apiClient.loadSeasonPlayerStats() : Promise.resolve(null)]);
    if (revision !== this.#revision) return stats;
    const statsByPlayerId = this.#createStatsMap(stats);
    const marketStatsById = this.#createStatsMap(marketStats || stats);
    players.forEach((player) => player.applyTourStats(statsByPlayerId.get(player.getId()) || this.#createEmptyStats(player, statsMonth)));
    players.forEach((player) => PlayerMarketStatsStore.applyPlayerStats(player, marketStatsById.get(player.getId())));
    return stats;
  }

  connectMonthTourPointsLoading(rootElement, players, rosterDomRenderer, getSelectedMonth) {
    rootElement.querySelector(".month-select")?.addEventListener("change", async () => {
      await this.applyTourPoints(players, getSelectedMonth());
      rosterDomRenderer.renderRosterSections();
      rootElement.dispatchEvent(new Event("player-market-stats-updated"));
    });
  }

  #createStatsMap(stats) {
    return new Map(stats.map((stat) => [stat.playerId, stat]));
  }

  #createEmptyStats(player, month) {
    return this.apiClient.createEmptyStats(player.getId(), month);
  }
}
