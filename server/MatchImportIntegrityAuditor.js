import { OutdatedProtocolImportAuditor } from "./OutdatedProtocolImportAuditor.js";

export class MatchImportIntegrityAuditor {
  constructor(outdatedImportAuditor = new OutdatedProtocolImportAuditor()) {
    this.outdatedImportAuditor = outdatedImportAuditor;
  }

  audit(database = {}) {
    return [...this.#findMissingScores(database.matches || []), ...this.outdatedImportAuditor.audit(database)];
  }

  #findMissingScores(matches) {
    return matches.filter((match) => !this.#hasValidScore(match.score)).map((match) => ({
      type: "missing_match_score", matchId: match.id, gameId: match.gameId || "", league: match.league || "",
      teams: [match.homeTeam, match.awayTeam].filter(Boolean).join(" - "),
    }));
  }

  #hasValidScore(score) {
    return score?.homeGoals != null && score?.awayGoals != null
      && Number.isFinite(Number(score.homeGoals)) && Number.isFinite(Number(score.awayGoals));
  }
}
