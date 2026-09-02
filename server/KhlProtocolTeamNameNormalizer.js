export class KhlProtocolTeamNameNormalizer {
  constructor(league) { this.league = league; }

  normalizeTeamName(teamName) {
    const normalized = String(teamName || "").trim();
    if (this.league === "МХЛ" && normalized === "Авто") return "МХК Авто";
    return normalized;
  }

  normalizeMatchTeams(match) {
    return { ...match, homeTeam: this.normalizeTeamName(match.homeTeam), awayTeam: this.normalizeTeamName(match.awayTeam),
      opponentTeam: this.#resolveOpponentTeam(match) };
  }

  #resolveOpponentTeam(match) {
    const teams = [this.normalizeTeamName(match.homeTeam), this.normalizeTeamName(match.awayTeam)];
    return teams.find((team) => !["Автомобилист", "Горняк-УГМК", "МХК Авто"].includes(team)) || teams[0] || "";
  }
}
