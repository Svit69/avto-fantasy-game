export class KhlMatchScopePolicy {
  constructor(automobilistTeamId = process.env.KHL_AUTOMOBILIST_TEAM_ID) { this.automobilistTeamId = automobilistTeamId; }

  canProcessMatch(match) {
    if (match.league !== "КХЛ") return false;
    const teamIds = [match.homeTeamId, match.awayTeamId].map(String);
    if (this.automobilistTeamId && teamIds.includes(String(this.automobilistTeamId))) return true;
    return [match.homeTeam, match.awayTeam].includes("Автомобилист");
  }
}
