import { ImportedMatchCalendarMatcher } from "./ImportedMatchCalendarMatcher.js";

export class DailyPlayerPointsMatchSelector {
  constructor(calendarMatcher = new ImportedMatchCalendarMatcher()) { this.calendarMatcher = calendarMatcher; }

  selectMatches(calendar, matchDatabase, matchDate) {
    const toursById = new Map((calendar.tours || []).map((tour) => [tour.id, tour]));
    return (calendar.matches || []).filter((match) => String(match.startsAt).slice(0, 10) === matchDate)
      .map((calendarMatch) => this.#createMatchSummary(calendarMatch, toursById, matchDatabase)).filter(Boolean);
  }

  #createMatchSummary(calendarMatch, toursById, matchDatabase) {
    const imports = (matchDatabase.matches || []).filter((match) =>
      this.calendarMatcher.findCalendarMatch(match, [calendarMatch]));
    const stats = this.#selectLatestPlayerStats(imports, matchDatabase.playerStats || []);
    const match = [...imports].sort((first, second) => this.#readImportTime(second) - this.#readImportTime(first))[0];
    return match && stats.length ? { match, calendarMatch, tour: toursById.get(calendarMatch.tourId), stats } : null;
  }

  #selectLatestPlayerStats(imports, playerStats) {
    const importsById = new Map(imports.map((match) => [match.id, match]));
    return [...playerStats.filter((stat) => importsById.has(stat.matchId)).reduce((selected, stat) => {
      const current = selected.get(stat.playerId); const match = importsById.get(stat.matchId);
      return !current || this.#readImportTime(match) >= this.#readImportTime(current.match)
        ? selected.set(stat.playerId, { stat, match }) : selected;
    }, new Map()).values()].map(({ stat }) => stat);
  }

  #readImportTime(match) { return Date.parse(match?.updatedAt || match?.lastEventAt || match?.createdAt || 0) || 0; }
}
