import { RussianCountFormatter } from "../formatters/RussianCountFormatter.js";
import { FantasyEventPresentationCatalog } from "../models/FantasyEventPresentationCatalog.js";
import { GoalkeeperFantasyScoringRulebook } from "../scoring/GoalkeeperFantasyScoringRulebook.js";

export class PlayerMatchStatRowFactory {
  constructor(formatter = new RussianCountFormatter(), catalog = new FantasyEventPresentationCatalog(), goalkeeperRules = new GoalkeeperFantasyScoringRulebook()) {
    Object.assign(this, { formatter, catalog, goalkeeperRules });
  }

  createRows(player, stats) {
    const position = player.getPosition();
    if (position === "вратарь") return this.#createGoalkeeperRows(stats);
    return [this.#createRow("goals", stats.goals, position === "защитник" ? 60 : 50),
      this.#createRow("assists", stats.assists, position === "защитник" ? 40 : 30),
      this.#createRow("shotsOnGoal", stats.shotsOnGoal, 5),
      this.#createRow("blockedShots", stats.blockedShots, position === "защитник" ? 10 : 5),
      this.#createRow("hits", stats.hits, 5), this.#createRow("takeaways", stats.takeaways, 10),
      this.#createRow("interceptions", stats.interceptions, 10), this.#createRow("penalties", stats.penalties, -10)].filter(Boolean);
  }

  #createGoalkeeperRows(stats) {
    return Object.entries(this.goalkeeperRules.rules)
      .map(([key, pointValue]) => this.#createRow(key, stats[key], pointValue)).filter(Boolean);
  }

  #createRow(key, count, pointValue) {
    const numericCount = Number(count || 0);
    if (!numericCount) return null;
    const words = this.catalog.findDefinition(key).words;
    return { label: this.formatter.formatCount(numericCount, words), points: numericCount * pointValue };
  }
}
