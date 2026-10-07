export class VhlMatchIdentityGuard {
  validate(sourceMatch, expectedMatch) {
    if (!expectedMatch) return;
    const matchesTeams = sourceMatch.homeTeam === expectedMatch.homeTeam
      && sourceMatch.awayTeam === expectedMatch.awayTeam;
    const matchesDate = sourceMatch.scheduledAt?.slice(0, 10) === expectedMatch.startsAt?.slice(0, 10);
    if (matchesTeams && matchesDate) return;
    const error = new Error("vhl_match_identity_mismatch");
    error.sourceMatch = sourceMatch;
    throw error;
  }
}
