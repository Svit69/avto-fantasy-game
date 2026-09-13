export class PlayerMatchTeamResolver {
  resolvePlayerTeam(player, match) {
    const matchTeams = this.#createMatchTeams(match);
    if (matchTeams.includes(player.getTeam())) return player.getTeam();
    return this.#findKnownMatchTeam(player, matchTeams) || this.#resolvePlayedFeaturedTeam(match, matchTeams) || player.getTeam();
  }

  resolveOpponentTeam(player, match) {
    return this.isPlayerHomeTeam(player, match) ? match.awayTeam : match.homeTeam;
  }

  isPlayerHomeTeam(player, match) {
    return this.resolvePlayerTeam(player, match) === match.homeTeam;
  }

  #findKnownMatchTeam(player, matchTeams) {
    return this.#createKnownTeams(player).find((team) => matchTeams.includes(team));
  }

  #resolvePlayedFeaturedTeam(match, matchTeams) {
    return match.playerMatchStats && matchTeams.includes(match.featuredTeam) ? match.featuredTeam : "";
  }

  #createKnownTeams(player) {
    return typeof player.getKnownTeams === "function" ? player.getKnownTeams() : [player.getTeam()];
  }

  #createMatchTeams(match) {
    return [match.homeTeam, match.awayTeam].filter(Boolean);
  }
}
