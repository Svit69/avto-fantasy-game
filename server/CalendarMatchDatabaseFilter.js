import { ImportedMatchCalendarMatcher } from "./ImportedMatchCalendarMatcher.js";

export class CalendarMatchDatabaseFilter {
  constructor(matcher = new ImportedMatchCalendarMatcher()) { this.matcher = matcher; }

  filter(calendarMatches, database) {
    const matches = (database.matches || []).filter((match) => this.matcher.findCalendarMatch(match, calendarMatches));
    const matchIds = new Set(matches.map((match) => match.id));
    return { ...database, matches,
      events: (database.events || []).filter((event) => matchIds.has(event.matchId)),
      playerStats: (database.playerStats || []).filter((stat) => matchIds.has(stat.matchId)) };
  }
}
