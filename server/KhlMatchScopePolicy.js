export class KhlMatchScopePolicy {
  constructor(automobilistTeamId = process.env.KHL_AUTOMOBILIST_TEAM_ID) { this.automobilistTeamId = automobilistTeamId; }

  canProcessMatch(match) {
    if (!["КХЛ", "ВХЛ", "МХЛ"].includes(match.league)) return false;
    const teamIds = [match.homeTeamId, match.awayTeamId].map(String);
    if (this.automobilistTeamId && teamIds.includes(String(this.automobilistTeamId))) return true;
    const teams = [match.homeTeam, match.awayTeam];
    return teams.includes("Автомобилист") || teams.includes("Горняк-УГМК") || teams.includes("МХК Авто");
  }
}
