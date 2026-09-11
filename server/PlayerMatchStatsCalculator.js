import { MonthlyImportedMatchSelector } from "./MonthlyImportedMatchSelector.js";
import { ImportedMatchCalendarMatcher } from "./ImportedMatchCalendarMatcher.js";

export class PlayerMatchStatsCalculator {
  constructor(matchSelector = new MonthlyImportedMatchSelector(), calendarMatcher = new ImportedMatchCalendarMatcher()) {
    Object.assign(this, { matchSelector, calendarMatcher });
  }

  createPlayerMatchStats({ playerId, month, calendar, matchDatabase }) {
    const importedMatches = this.matchSelector.selectLatestMonthMatches(month, calendar, matchDatabase.matches || []);
    const calendarMatches = this.#findMonthCalendarMatches(month, calendar);
    const statsByMatchId = new Map((matchDatabase.playerStats || [])
      .filter((stat) => stat.playerId === playerId).map((stat) => [stat.matchId, stat]));
    return importedMatches.map((match) => this.#createMatchStats(match, statsByMatchId.get(match.id), calendarMatches));
  }

  #createMatchStats(match, stats = {}, calendarMatches) {
    const calendarMatch = this.calendarMatcher.findCalendarMatch(match, calendarMatches);
    const score = this.#createScore(match);
    return { matchId: match.id, calendarMatchId: calendarMatch?.id || "", gameId: match.gameId, homeTeam: match.homeTeam, awayTeam: match.awayTeam,
      homeScore: score?.homeGoals ?? null, awayScore: score?.awayGoals ?? null,
      status: match.status || "finished", ...this.#createStatFields(stats) };
  }

  #createScore(match) {
    if (match.score) return { homeGoals: Number(match.score.homeGoals), awayGoals: Number(match.score.awayGoals) };
    if (match.homeScore == null || match.awayScore == null) return null;
    return { homeGoals: Number(match.homeScore), awayGoals: Number(match.awayScore) };
  }

  #findMonthCalendarMatches(month, calendar) {
    const tourIds = new Set((calendar.tours || []).filter((tour) => tour.month === month).map((tour) => tour.id));
    return (calendar.matches || []).filter((match) => tourIds.has(match.tourId));
  }

  #createStatFields(stats) {
    return { goals: Number(stats.goals || 0), assists: Number(stats.assists || 0), penalties: Number(stats.penalties || 0),
      shotsOnGoal: Number(stats.shotsOnGoal || 0), blockedShots: Number(stats.blockedShots || 0), hits: Number(stats.hits || 0),
      takeaways: Number(stats.takeaways || 0), interceptions: Number(stats.interceptions || 0), saves: Number(stats.saves || 0),
      goalsAgainst: Number(stats.goalsAgainst || 0), fantasyPoints: Number(stats.fantasyPoints || 0) };
  }
}
