import { ImportedMatchCalendarMatcher } from "./ImportedMatchCalendarMatcher.js";

export class PlayerTourStatsCalculator {
  constructor(matchMatcher = new ImportedMatchCalendarMatcher()) { this.matchMatcher = matchMatcher; }

  createMonthlyPlayerStats({ playerId, month, calendar, matchDatabase }) {
    const matches = this.#findMonthImportedMatches(month, calendar, matchDatabase.matches || []);
    const playerStats = this.#findPlayerStats(playerId, matches, matchDatabase.playerStats || []);
    return { playerId, month, ...this.#sumPlayerStats(playerStats), matches: playerStats.length };
  }

  #findMonthImportedMatches(month, calendar, importedMatches) {
    const calendarMatches = this.#findMonthCalendarMatches(calendar, month);
    return importedMatches.filter((match) => this.matchMatcher.findCalendarMatch(match, calendarMatches));
  }

  #findMonthCalendarMatches(calendar, month) {
    const tourIds = new Set((calendar.tours || []).filter((tour) => tour.month === month).map((tour) => tour.id));
    return (calendar.matches || []).filter((match) => tourIds.has(match.tourId));
  }

  #findPlayerStats(playerId, matches, playerStats) {
    const matchIds = new Set(matches.map((match) => match.id));
    return playerStats.filter((stat) => stat.playerId === playerId && matchIds.has(stat.matchId));
  }

  #sumPlayerStats(stats) {
    return this.#statFields().reduce((sum, field) => ({ ...sum, [field]: stats.reduce((total, stat) => total + Number(stat[field] || 0), 0) }), {});
  }

  #statFields() {
    return ["goals", "assists", "penalties", "shotsOnGoal", "blockedShots", "hits", "takeaways", "interceptions", "saves", "goalsAgainst", "fantasyPoints"];
  }
}
