import { PlayerTourStatsApiClient } from "./PlayerTourStatsApiClient.js";

export class PlayerProfileCalendarPresenter {
  constructor(calendarApiClient, getSelectedMonth, statsApiClient = new PlayerTourStatsApiClient()) {
    Object.assign(this, { calendarApiClient, getSelectedMonth, statsApiClient });
    this.calendar = null; this.profileCalendar = null;
  }

  async renderPlayerProfile(profileView, player, selected) {
    const month = this.getSelectedMonth();
    const [calendar, tourStats] = await Promise.all([this.#loadCalendar(), this.statsApiClient.loadPlayerTourStats(player.getId(), month)]);
    this.profileCalendar = this.#attachPlayerMatchStats(calendar, tourStats);
    return profileView.render(player, selected, this.profileCalendar, month, tourStats);
  }

  async findPlayerMonthMatches(player) {
    const calendar = this.profileCalendar || await this.#loadCalendar();
    const tourIds = new Set(calendar.tours.filter((tour) => tour.month === this.getSelectedMonth()).map((tour) => tour.id));
    return calendar.matches.filter((match) => tourIds.has(match.tourId) && [match.homeTeam, match.awayTeam].includes(player.getTeam()));
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
