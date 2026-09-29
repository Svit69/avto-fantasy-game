import { ROSTER_POSITIONS } from "../data/positions.js";
import { GoalkeeperFantasyScoringRulebook } from "../scoring/GoalkeeperFantasyScoringRulebook.js";
import { LeagueFantasyMultiplierPolicy } from "../scoring/LeagueFantasyMultiplierPolicy.js";
import { SkaterFantasyScoringRulebook } from "../scoring/SkaterFantasyScoringRulebook.js";

export class FantasyScoringGuideModel {
  constructor(skaterRules = new SkaterFantasyScoringRulebook(), goalkeeperRules = new GoalkeeperFantasyScoringRulebook(), leaguePolicy = new LeagueFantasyMultiplierPolicy()) {
    Object.assign(this, { skaterRules, goalkeeperRules, leaguePolicy });
  }

  createGuide() {
    return { leagues: this.#createLeagueRows(), skaters: this.#createSkaterRows(), goalkeepers: this.#createGoalkeeperRows() };
  }

  #createLeagueRows() {
    return Object.entries(this.leaguePolicy.multipliersByLeague).map(([label, value]) => ({ label, value: `×${String(value).replace(".", ",")}` }));
  }

  #createSkaterRows() {
    const forward = this.skaterRules.rules[ROSTER_POSITIONS.forward]; const defender = this.skaterRules.rules[ROSTER_POSITIONS.defender];
    return this.#eventLabels().filter(({ key }) => key in forward).map(({ key, label }) => ({ label, forward: forward[key], defender: defender[key] }));
  }

  #createGoalkeeperRows() {
    return this.#eventLabels().filter(({ key }) => key in this.goalkeeperRules.rules)
      .map(({ key, label }) => ({ label, value: this.goalkeeperRules.rules[key] }));
  }

  #eventLabels() {
    return [{ key: "goals", label: "Гол" }, { key: "assists", label: "Передача" }, { key: "penalties", label: "Удаление" },
      { key: "shotsOnGoal", label: "Бросок в створ" }, { key: "blockedShots", label: "Блокированный бросок" },
      { key: "hits", label: "Силовой приём" }, { key: "takeaways", label: "Отбор" }, { key: "interceptions", label: "Перехват" },
      { key: "saves", label: "Сейв" }, { key: "goalsAgainst", label: "Пропущенный гол" }];
  }
}
