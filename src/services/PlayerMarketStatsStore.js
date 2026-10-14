export class PlayerMarketStatsStore {
  static #stats = new WeakMap();
  static applyPlayerStats(player, stats = {}) {
    this.#stats.set(player, { fantasyPoints: Number(stats.fantasyPoints) || 0,
      goals: Number(stats.goals) || 0, assists: Number(stats.assists) || 0, matches: Number(stats.matches) || 0 });
  }
  static readPlayerStats(player) {
    return this.#stats.get(player) || { fantasyPoints: 0, goals: 0, assists: 0, matches: 0 };
  }
}
