export class LeagueFantasyMultiplierPolicy {
  constructor() {
    this.multipliersByLeague = Object.freeze({ КХЛ: 1, ВХЛ: 0.8, МХЛ: 0.6 });
    this.leaguesByTeam = Object.freeze({ Автомобилист: "КХЛ", "Горняк-УГМК": "ВХЛ", "МХК Авто": "МХЛ" });
  }

  resolveFantasyPointMultiplier({ league, team }) {
    const resolvedLeague = league || this.leaguesByTeam[team];
    return this.multipliersByLeague[resolvedLeague] ?? 1;
  }
}
