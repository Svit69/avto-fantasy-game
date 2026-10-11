import { FANTASY_ROSTER_RULES } from "../src/config/FantasyRosterRules.js";

export class PriceReviewRosterOptimizer {
  constructor(rules = FANTASY_ROSTER_RULES) { this.rules = rules; }
  findOptimalRoster(players, evaluatePlayer = (player) => -player.price, requiredPlayerId = null) {
    const positions = ["нападающий", "защитник", "вратарь"];
    const limits = [3, 2, 1];
    const eligible = players.filter((player) => positions.includes(player.position) && Number.isFinite(player.price) && player.price >= 0);
    const teams = [...new Set(eligible.map((player) => player.team))];
    let initial = { counts: [0, 0, 0], clubs: teams.map(() => 0), players: [], value: 0 };
    if (requiredPlayerId) {
      const required = eligible.find((player) => player.id === requiredPlayerId);
      if (!required) return null;
      initial = this.#addPlayer(initial, required, positions, teams, evaluatePlayer);
    }
    const states = new Map([[this.#createStateKey(initial), initial]]);
    for (const player of eligible) {
      if (player.id === requiredPlayerId) continue;
      const positionIndex = positions.indexOf(player.position);
      const clubIndex = teams.indexOf(player.team);
      for (const state of [...states.values()]) {
        if (state.counts[positionIndex] >= limits[positionIndex] || state.clubs[clubIndex] >= this.rules.clubPlayerLimit) continue;
        const next = this.#addPlayer(state, player, positions, teams, evaluatePlayer);
        const key = this.#createStateKey(next);
        if (!states.has(key) || next.value > states.get(key).value) states.set(key, next);
      }
    }
    const complete = [...states.values()].filter((state) => state.counts.every((count, index) => count === limits[index]));
    const best = complete.sort((first, second) => second.value - first.value)[0];
    return best ? { players: best.players, value: best.value, cost: best.players.reduce((sum, player) => sum + player.price, 0) } : null;
  }
  #addPlayer(state, player, positions, teams, evaluatePlayer) {
    const counts = [...state.counts];
    const clubs = [...state.clubs];
    counts[positions.indexOf(player.position)] += 1;
    clubs[teams.indexOf(player.team)] += 1;
    return { counts, clubs, players: [...state.players, player], value: state.value + evaluatePlayer(player) };
  }
  #createStateKey(state) { return [...state.counts, ...state.clubs].join(":"); }
}
