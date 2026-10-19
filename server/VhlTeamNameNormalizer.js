export class VhlTeamNameNormalizer {
  normalizeTeamName(value) {
    const name = this.#unwrapQuotes(String(value || "").normalize("NFC").replace(/\s+/g, " ").trim());
    return this.#unwrapQuotes(name.replace(/^хк(?:\s+|(?=[«"“]))/iu, ""));
  }
  createComparisonKey(value) { return this.normalizeTeamName(value).toLowerCase().replace(/ё/g, "е"); }
  normalizeMatchTeams(match, expectedMatch = null) {
    const homeTeam = expectedMatch?.homeTeam ?? this.normalizeTeamName(match.homeTeam);
    const awayTeam = expectedMatch?.awayTeam ?? this.normalizeTeamName(match.awayTeam);
    const ownTeam = this.createComparisonKey("Горняк-УГМК");
    const opponentTeam = this.createComparisonKey(homeTeam) === ownTeam ? awayTeam : homeTeam;
    return { ...match, homeTeam, awayTeam, opponentTeam };
  }
  #unwrapQuotes(value) { return value.trim().replace(/^[«»"“”]+|[«»"“”]+$/gu, "").trim(); }
}
