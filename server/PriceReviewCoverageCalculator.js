export class PriceReviewCoverageCalculator {
  calculateTeamCoverage(team, context, data) {
    const expected = context.matches.filter((match) => match.tourId === context.tours[0]?.id
      && [match.homeTeam, match.awayTeam].includes(team) && context.now.getTime() - Date.parse(match.startsAt) >= 4 * 60 * 60 * 1000);
    const completed = new Set(data.matches.filter((match) => data.playerStats.some((stat) => stat.matchId === match.id
      && Number.isFinite(stat.fantasyPoints))).map((match) => match.calendarMatchId));
    const loaded = expected.filter((match) => completed.has(match.id)).length;
    return { team, expected: expected.length, loaded, sufficient: expected.length > 0 && loaded / expected.length >= 0.8 };
  }
}
