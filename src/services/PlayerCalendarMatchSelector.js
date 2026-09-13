export class PlayerCalendarMatchSelector {
  selectPlayerMonthMatches(player, calendar, selectedMonth) {
    const tourIds = this.#createMonthTourIds(calendar, selectedMonth);
    return calendar.matches.filter((match) => tourIds.has(match.tourId) && this.#isPlayerMatch(player, match));
  }

  #createMonthTourIds(calendar, selectedMonth) {
    return new Set(calendar.tours.filter((tour) => tour.month === selectedMonth).map((tour) => tour.id));
  }

  #isPlayerMatch(player, match) {
    return Boolean(match.playerMatchStats) || this.#isCurrentTeamMatch(player, match);
  }

  #isCurrentTeamMatch(player, match) {
    return [match.homeTeam, match.awayTeam].includes(player.getTeam());
  }
}
