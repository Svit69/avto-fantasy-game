import { PlayerTourStatsApiClient } from "./PlayerTourStatsApiClient.js";
import { PlayerCalendarMatchSelector } from "./PlayerCalendarMatchSelector.js";
import { PlayerStatsTourResolver } from "./PlayerStatsTourResolver.js";

export class PlayerProfileCalendarPresenter {
  constructor(calendarApiClient, getSelectedMonth, statsApiClient = new PlayerTourStatsApiClient(), matchSelector = new PlayerCalendarMatchSelector(), statsTourResolver = new PlayerStatsTourResolver()) {
    Object.assign(this, { calendarApiClient, getSelectedMonth, statsApiClient, matchSelector, statsTourResolver });
    this.calendar = null; this.profileCalendar = null;
  }

  async renderPlayerProfile(profileView, player, selected) {
    const month = this.getSelectedMonth();
    const calendar = await this.#loadCalendar();
    const statsMonth = this.statsTourResolver.resolveStatsMonth(calendar, month);
    const tourStats = await this.statsApiClient.loadPlayerTourStats(player.getId(), statsMonth);
    this.profileCalendar = this.#attachPlayerMatchStats(calendar, tourStats);
    return profileView.render(player, selected, this.profileCalendar, month, tourStats, statsMonth);
  }

  async findPlayerMonthMatches(player) {
    const calendar = this.profileCalendar || await this.#loadCalendar();
    return this.matchSelector.selectPlayerMonthMatches(player, calendar, this.getSelectedMonth());
  }

  renderMatchDetails(profileView, player, match) {
    return profileView.calendarView.renderMatchDetails(player, match);
  }

  async #loadCalendar() {
    this.calendar ||= await this.calendarApiClient.loadFantasyCalendar();
    return this.calendar;
  }

  #attachPlayerMatchStats(calendar, tourStats) {
    const statsByMatchId = new Map((tourStats.matchStats || []).map((stats) => [stats.calendarMatchId, stats]));
    return { ...calendar, matches: calendar.matches.map((match) => ({ ...match, playerMatchStats: statsByMatchId.get(match.id) || null })) };
  }
}
