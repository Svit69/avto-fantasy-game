import { PriceReviewRosterOptimizer } from "./PriceReviewRosterOptimizer.js";
import { FANTASY_ROSTER_RULES } from "../src/config/FantasyRosterRules.js";

export class BudgetedAutoRosterSelector {
  constructor(optimizer = new PriceReviewRosterOptimizer(), rules = FANTASY_ROSTER_RULES) { Object.assign(this, { optimizer, rules }); }
  selectPlayers(players) {
    const cheapest = this.optimizer.findOptimalRoster(players);
    if (!cheapest || cheapest.cost > this.rules.budgetLimit) return null;
    const selected = [...cheapest.players]; let cost = cheapest.cost;
    const score = (player) => Number.isFinite(player.autoScore) ? player.autoScore : 0;
    for (let pass = 0; pass < 6; pass++) {
      let improved = false;
      for (let index = 0; index < selected.length; index++) {
        const current = selected[index];
        const options = players.filter((player) => player.position === current.position && !selected.some((item) => item.id === player.id)
          && cost - current.price + player.price <= this.rules.budgetLimit
          && selected.filter((item, slot) => slot !== index && item.team === player.team).length < this.rules.clubPlayerLimit)
          .sort((first, second) => score(second) - score(first) || first.price - second.price || first.id.localeCompare(second.id));
        if (options[0] && score(options[0]) > score(current)) {
          selected[index] = options[0]; cost += options[0].price - current.price; improved = true;
        }
      }
      if (!improved) break;
    }
    const positions = ["нападающий", "защитник", "вратарь"];
    return selected.sort((first, second) => positions.indexOf(first.position) - positions.indexOf(second.position) || first.id.localeCompare(second.id));
  }
}
