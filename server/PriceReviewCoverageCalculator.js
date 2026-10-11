export class PriceReviewCoverageCalculator {
  calculateTeamCoverage(team, context, data) {
    const expected = context.matches.filter((match) => [match.homeTeam, match.awayTeam].includes(team)
      && context.now.getTime() - Date.parse(match.startsAt) >= 4 * 60 * 60 * 1000)
      .sort((first, second) => Date.parse(second.startsAt) - Date.parse(first.startsAt)).slice(0, 10);
    const completed = new Set(data.matches.filter((match) => data.playerStats.some((stat) => stat.matchId === match.id
      && Number.isFinite(stat.fantasyPoints))).map((match) => match.calendarMatchId));
    const loaded = expected.filter((match) => completed.has(match.id)).length;
    return { team, expected: expected.length, loaded, sufficient: !expected.length || loaded / expected.length >= 0.8 };
  }
}
