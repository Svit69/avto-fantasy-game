export class KhlMatchScopePolicy {
  constructor(automobilistTeamId = process.env.KHL_AUTOMOBILIST_TEAM_ID) { this.automobilistTeamId = automobilistTeamId; }

  canProcessMatch(match) {
    if (!this.automobilistTeamId) return false;
    if (match.league !== "КХЛ") return false;
    return [match.homeTeamId, match.awayTeamId].map(String).includes(String(this.automobilistTeamId));
  }
}
