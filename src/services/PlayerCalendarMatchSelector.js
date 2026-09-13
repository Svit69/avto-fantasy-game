export class PlayerCalendarMatchSelector {
  constructor(nowProvider = () => Date.now()) {
    this.nowProvider = nowProvider;
  }

  selectPlayerMonthMatches(player, calendar, selectedMonth) {
    const tourIds = this.#createMonthTourIds(calendar, selectedMonth);
    return calendar.matches.filter((match) => tourIds.has(match.tourId) && this.#isPlayerMatch(player, match));
  }

  #createMonthTourIds(calendar, selectedMonth) {
    return new Set(calendar.tours.filter((tour) => tour.month === selectedMonth).map((tour) => tour.id));
  }

  #isPlayerMatch(player, match) {
    return Boolean(match.playerMatchStats) || this.#isFutureCurrentTeamMatch(player, match);
  }

  #isFutureCurrentTeamMatch(player, match) {
    return this.#isCurrentTeamMatch(player, match) && this.#isFutureMatch(match);
  }

  #isCurrentTeamMatch(player, match) {
    return [match.homeTeam, match.awayTeam].includes(player.getTeam());
  }

  #isFutureMatch(match) {
    return Date.parse(match.startsAt || 0) > this.nowProvider();
  }
}
