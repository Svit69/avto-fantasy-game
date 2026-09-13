import { KhlProtocolTeamNameNormalizer } from "./KhlProtocolTeamNameNormalizer.js";
import { KhlProtocolPlayerNameMatcher } from "./KhlProtocolPlayerNameMatcher.js";

export class KhlProtocolPlayerMatcher {
  constructor(players, league, nameMatcher = new KhlProtocolPlayerNameMatcher()) {
    Object.assign(this, { players, nameMatcher, teamNormalizer: new KhlProtocolTeamNameNormalizer(league) });
  }

  findPlayer(row) {
    const teamPlayers = this.players.filter((player) => this.#hasTeamInHistory(player, row.team));
    return this.#findPlayerByName(teamPlayers, row) || this.#findTrustedPlayerByNumber(teamPlayers, row) || this.#findUniquePlayerByName(row);
  }

  #findPlayerByName(teamPlayers, row) {
    return teamPlayers.find((player) => this.nameMatcher.isSamePlayer(player, row.name)) || null;
  }

  #findTrustedPlayerByNumber(teamPlayers, row) {
    return teamPlayers.find((player) => this.nameMatcher.canTrustNumber(player, row)) || null;
  }

  #findUniquePlayerByName(row) {
    const matchedPlayers = this.players.filter((player) => this.nameMatcher.isSamePlayer(player, row.name));
    return matchedPlayers.length === 1 ? matchedPlayers[0] : null;
  }

  #hasTeamInHistory(player, rowTeam) {
    return this.#createKnownTeams(player).some((team) => this.#sameTeam(team, rowTeam));
  }

  #createKnownTeams(player) {
    return [...new Set([player.team, ...(player.teamHistory || [])].filter(Boolean))];
  }

  #sameTeam(playerTeam, rowTeam) {
    return this.#normalizeName(playerTeam) === this.#normalizeName(this.teamNormalizer.normalizeTeamName(rowTeam));
  }

  #normalizeName(value) {
    return String(value || "").toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();
  }
}
