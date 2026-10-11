export class PlayerPriceAffordabilityPlanner {
  constructor(optimizer) { this.optimizer = optimizer; }
  planAffordableChanges(evaluations, performances, budget) {
    const players = performances.map((item) => item.player);
    let prices = new Map(players.map((player) => [player.id, player.price]));
    const suggestions = evaluations.filter((item) => item.reason === "recommendation");
    for (const item of suggestions) if (item.suggestedPrice <= item.player.price) prices.set(item.player.id, item.suggestedPrice);
    let witnesses = new Map();
    const increases = suggestions.filter((item) => item.suggestedPrice > item.player.price)
      .sort((first, second) => Math.abs(second.gap || 0) - Math.abs(first.gap || 0) || first.player.id.localeCompare(second.player.id));
    for (const candidate of increases) {
      const trialPrices = new Map(prices).set(candidate.player.id, candidate.suggestedPrice);
      const trialPlayers = players.map((player) => ({ ...player, price: trialPrices.get(player.id) }));
      const trialWitnesses = new Map(witnesses);
      let affordable = true;
      for (const playerId of [candidate.player.id, ...witnesses.keys()]) {
        let roster = trialWitnesses.get(playerId);
        if (!roster || this.#calculateCost(roster, trialPrices) > budget.limit) roster = this.optimizer.findOptimalRoster(trialPlayers, undefined, playerId);
        if (!roster || this.#calculateCost(roster, trialPrices) > budget.limit) { affordable = false; break; }
        trialWitnesses.set(playerId, roster);
      }
      if (affordable) { prices = trialPrices; witnesses = trialWitnesses; }
    }
    const results = evaluations.map((item) => {
      if (item.reason !== "recommendation" || item.suggestedPrice <= item.player.price) return item;
      const roster = witnesses.get(item.player.id);
      return roster ? { ...item, affordableRosterCost: this.#calculateCost(roster, prices) } : { reason: "budget" };
    });
    const finalPlayers = players.map((player) => ({ ...player, price: prices.get(player.id) }));
    return { evaluations: results, budget: { ...budget, minimumAfter: this.optimizer.findOptimalRoster(finalPlayers)?.cost ?? null } };
  }
  #calculateCost(roster, prices) { return roster.players.reduce((sum, player) => sum + prices.get(player.id), 0); }
}
