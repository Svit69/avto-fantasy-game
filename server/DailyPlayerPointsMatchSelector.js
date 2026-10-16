import { ImportedMatchCalendarMatcher } from "./ImportedMatchCalendarMatcher.js";
import { ImportedMatchPriorityPolicy } from "./ImportedMatchPriorityPolicy.js";
import { ImportedMatchAuthoritySelector } from "./ImportedMatchAuthoritySelector.js";

export class DailyPlayerPointsMatchSelector {
  constructor(calendarMatcher = new ImportedMatchCalendarMatcher()) { this.calendarMatcher = calendarMatcher; }

  selectMatches(calendar, matchDatabase, matchDate) {
    const toursById = new Map((calendar.tours || []).map((tour) => [tour.id, tour]));
    return (calendar.matches || []).filter((match) => String(match.startsAt).slice(0, 10) === matchDate)
      .map((calendarMatch) => this.#createMatchSummary(calendarMatch, toursById, matchDatabase)).filter(Boolean);
  }

  #createMatchSummary(calendarMatch, toursById, matchDatabase) {
    const authoritative = new ImportedMatchAuthoritySelector().selectAuthoritativeImports(matchDatabase.matches || [], [calendarMatch]);
    const imports = authoritative.filter((match) =>
      this.calendarMatcher.findCalendarMatch(match, [calendarMatch]));
    const stats = this.#selectLatestPlayerStats(imports, matchDatabase.playerStats || []);
    const match = [...imports].sort((first, second) => new ImportedMatchPriorityPolicy().compare(second, first))[0];
    return match && stats.length ? { match, calendarMatch, tour: toursById.get(calendarMatch.tourId), stats } : null;
  }

  #selectLatestPlayerStats(imports, playerStats) {
    const importsById = new Map(imports.map((match) => [match.id, match]));
    return [...playerStats.filter((stat) => importsById.has(stat.matchId)).reduce((selected, stat) => {
      const current = selected.get(stat.playerId); const match = importsById.get(stat.matchId);
      return !current || new ImportedMatchPriorityPolicy().compare(match, current.match) >= 0
        ? selected.set(stat.playerId, { stat, match }) : selected;
    }, new Map()).values()].map(({ stat }) => stat);
  }

}
