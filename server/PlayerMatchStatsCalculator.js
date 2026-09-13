import { MonthlyPlayerMatchStatSelector } from "./MonthlyPlayerMatchStatSelector.js";

export class PlayerMatchStatsCalculator {
  constructor(playerStatSelector = new MonthlyPlayerMatchStatSelector()) {
    this.playerStatSelector = playerStatSelector;
  }

  createPlayerMatchStats({ playerId, month, calendar, matchDatabase }) {
    return this.playerStatSelector.selectPlayerMatchStats({ playerId, month, calendar, matchDatabase })
      .map(({ match, stat, calendarMatch }) => this.#createMatchStats(match, stat, calendarMatch));
  }

  #createMatchStats(match, stats, calendarMatch) {
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

  #createStatFields(stats) {
    return { goals: Number(stats.goals || 0), assists: Number(stats.assists || 0), penalties: Number(stats.penalties || 0),
      shotsOnGoal: Number(stats.shotsOnGoal || 0), blockedShots: Number(stats.blockedShots || 0), hits: Number(stats.hits || 0),
      takeaways: Number(stats.takeaways || 0), interceptions: Number(stats.interceptions || 0), saves: Number(stats.saves || 0),
      goalsAgainst: Number(stats.goalsAgainst || 0), fantasyPoints: Number(stats.fantasyPoints || 0) };
  }
}
