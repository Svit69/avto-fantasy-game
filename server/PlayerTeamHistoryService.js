export class PlayerTeamHistoryService {
  createPlayerWithTransferredTeam(player, nextTeam, teamAssets) {
    return { ...player, ...teamAssets, team: nextTeam, teamHistory: this.#createTeamHistory(player, nextTeam) };
  }

  #createTeamHistory(player, nextTeam) {
    return this.#createUniqueTeams([...(player.teamHistory || []), player.team, nextTeam]);
  }

  #createUniqueTeams(teams) {
    return [...new Set(teams.map((team) => String(team || "").trim()).filter(Boolean))];
  }
}
