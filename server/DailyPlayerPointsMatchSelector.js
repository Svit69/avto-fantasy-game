import { ImportedMatchCalendarMatcher } from "./ImportedMatchCalendarMatcher.js";

export class DailyPlayerPointsMatchSelector {
  constructor(calendarMatcher = new ImportedMatchCalendarMatcher()) { this.calendarMatcher = calendarMatcher; }

  selectMatches(calendar, matchDatabase, matchDate) {
    const toursById = new Map((calendar.tours || []).map((tour) => [tour.id, tour]));
    return (matchDatabase.matches || []).map((match) => {
      const calendarMatch = this.calendarMatcher.findCalendarMatch(match, calendar.matches || []);
      if (!calendarMatch || String(calendarMatch.startsAt).slice(0, 10) !== matchDate) return null;
      const stats = this.#findMatchStats(matchDatabase.playerStats || [], match.id);
      return stats.length ? { match, calendarMatch, tour: toursById.get(calendarMatch.tourId), stats } : null;
    }).filter(Boolean);
  }

  #findMatchStats(playerStats, matchId) {
    return playerStats.filter((stat) => stat.matchId === matchId);
  }
}
