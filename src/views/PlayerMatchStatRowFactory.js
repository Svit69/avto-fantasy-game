import { RussianCountFormatter } from "../formatters/RussianCountFormatter.js";
import { FantasyEventPresentationCatalog } from "../models/FantasyEventPresentationCatalog.js";

export class PlayerMatchStatRowFactory {
  constructor(formatter = new RussianCountFormatter(), catalog = new FantasyEventPresentationCatalog()) {
    Object.assign(this, { formatter, catalog });
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
    return [this.#createRow("saves", stats.saves, 3), this.#createRow("goalsAgainst", stats.goalsAgainst, -15),
      this.#createRow("penalties", stats.penalties, -10)].filter(Boolean);
  }

  #createRow(key, count, pointValue) {
    const numericCount = Number(count || 0);
    if (!numericCount) return null;
    const words = this.catalog.findDefinition(key).words;
    return { label: this.formatter.formatCount(numericCount, words), points: numericCount * pointValue };
  }
}
