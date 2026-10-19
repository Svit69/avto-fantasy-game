import { VhlTeamNameNormalizer } from "./VhlTeamNameNormalizer.js";
export class VhlMatchIdentityGuard {
  constructor(normalizer = new VhlTeamNameNormalizer()) { this.normalizer = normalizer; }
  validate(sourceMatch, expectedMatch) {
    if (!expectedMatch) return;
    const sourceTeams = [sourceMatch.homeTeam, sourceMatch.awayTeam].map((team) => this.normalizer.createComparisonKey(team));
    const expectedTeams = [expectedMatch.homeTeam, expectedMatch.awayTeam].map((team) => this.normalizer.createComparisonKey(team));
    const matchesTeams = sourceTeams.every((team, index) => team && team === expectedTeams[index]);
    const matchesDate = sourceMatch.scheduledAt?.slice(0, 10) === expectedMatch.startsAt?.slice(0, 10);
    if (matchesTeams && matchesDate) return;
    const error = new Error("vhl_match_identity_mismatch");
    error.sourceMatch = sourceMatch;
    throw error;
  }
}
