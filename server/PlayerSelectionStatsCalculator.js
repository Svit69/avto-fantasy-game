export class PlayerSelectionStatsCalculator {
  createMonthlySelectionStats(rosters, month) {
    const monthlyRosters = rosters.filter((roster) => roster.month === month && this.#hasPlayers(roster));
    const players = this.#countSelectedPlayers(monthlyRosters);
    return { month, totalManagers: monthlyRosters.length, players: this.#calculatePercentages(players, monthlyRosters.length) };
  }

  #countSelectedPlayers(rosters) {
    return rosters.reduce((summary, roster) => {
      this.#selectUniquePlayerIds(roster).forEach((playerId) => {
        const stat = summary[playerId] || { selectedTeams: 0, selectionPercent: 0 };
        summary[playerId] = { ...stat, selectedTeams: stat.selectedTeams + 1 };
      });
      return summary;
    }, {});
  }

  #calculatePercentages(players, totalManagers) {
    return Object.fromEntries(Object.entries(players).map(([playerId, stat]) => [
      playerId, { ...stat, selectionPercent: totalManagers ? Math.round((stat.selectedTeams / totalManagers) * 100) : 0 },
    ]));
  }

  #hasPlayers(roster) { return this.#selectUniquePlayerIds(roster).length > 0; }

  #selectUniquePlayerIds(roster) {
    return [...new Set((roster.slots || []).map((slot) => slot.playerId).filter(Boolean))];
  }
}
