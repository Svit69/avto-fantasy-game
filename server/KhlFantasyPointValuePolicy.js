export class KhlFantasyPointValuePolicy {
  constructor() {
    this.skaterRules = Object.freeze({
      "нападающий": { goals: 50, assists: 30, penalties: -10, shotsOnGoal: 5, hits: 5, takeaways: 10, interceptions: 10 },
      "защитник": { goals: 60, assists: 40, penalties: -10, shotsOnGoal: 5, hits: 5, takeaways: 10, interceptions: 10 },
    });
    this.goalkeeperRules = Object.freeze({ saves: 3, goalsAgainst: -15, penalties: -10, assists: 30, goals: 100 });
  }

  resolveEventPoints(player, eventType) {
    const rules = player?.position === "вратарь" ? this.goalkeeperRules : this.skaterRules[player?.position];
    return Number(rules?.[eventType] || 0);
  }
}
