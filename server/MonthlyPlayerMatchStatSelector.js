import { ImportedMatchCalendarMatcher } from "./ImportedMatchCalendarMatcher.js";

export class MonthlyPlayerMatchStatSelector {
  constructor(calendarMatcher = new ImportedMatchCalendarMatcher()) {
    this.calendarMatcher = calendarMatcher;
  }

  selectPlayerMatchStats({ playerId, month, calendar, matchDatabase }) {
    const calendarMatches = this.#findMonthCalendarMatches(month, calendar);
    const matchesById = new Map((matchDatabase.matches || []).map((match) => [match.id, match]));
    return [...this.#selectLatestStats(playerId, matchDatabase.playerStats || [], matchesById, calendarMatches).values()];
  }

  #selectLatestStats(playerId, playerStats, matchesById, calendarMatches) {
    return playerStats.filter((stat) => stat.playerId === playerId).reduce((selected, stat) => {
      const match = matchesById.get(stat.matchId);
      const calendarMatch = match ? this.calendarMatcher.findCalendarMatch(match, calendarMatches) : null;
      if (!calendarMatch) return selected;
      const current = selected.get(calendarMatch.id);
      return this.#isNewerImport(match, current?.match) ? selected.set(calendarMatch.id, { match, stat, calendarMatch }) : selected;
    }, new Map());
  }

  #findMonthCalendarMatches(month, calendar) {
    const tourIds = new Set((calendar.tours || []).filter((tour) => tour.month === month).map((tour) => tour.id));
    return (calendar.matches || []).filter((match) => tourIds.has(match.tourId));
  }

  #isNewerImport(candidate, current) {
    if (!current) return true;
    return this.#readImportTime(candidate) >= this.#readImportTime(current);
  }

  #readImportTime(match) {
    return Date.parse(match.updatedAt || match.lastEventAt || match.createdAt || 0) || 0;
  }
}
