export class PlayerProfileCalendarPresenter {
  constructor(calendarApiClient, getSelectedMonth) {
    Object.assign(this, { calendarApiClient, getSelectedMonth });
    this.calendar = null;
  }

  async renderPlayerProfile(profileView, player, selected) {
    const calendar = await this.#loadCalendar();
    return profileView.render(player, selected, calendar, this.getSelectedMonth());
  }

  async findPlayerMonthMatches(player) {
    const calendar = await this.#loadCalendar();
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
}
