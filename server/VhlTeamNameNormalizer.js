export class VhlTeamNameNormalizer {
  #aliases = new Map([
    ["сокол кр", "Сокол"], ["сокол кр.", "Сокол"],
    ["металлург нк", "Металлург Новокузнецк"], ["металлург нк.", "Металлург Новокузнецк"]
  ]);
  normalizeTeamName(value) {
    const name = this.#unwrapQuotes(String(value || "").normalize("NFC").replace(/\s+/g, " ").trim());
    const normalized = this.#unwrapQuotes(name.replace(/^хк(?:\s+|(?=[«"“]))/iu, ""));
    return this.#aliases.get(normalized.toLowerCase()) || normalized;
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
