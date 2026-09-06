import { KhlProtocolTeamNameNormalizer } from "./KhlProtocolTeamNameNormalizer.js";
import { KhlProtocolPlayerNameMatcher } from "./KhlProtocolPlayerNameMatcher.js";

export class KhlProtocolPlayerMatcher {
  constructor(players, league, nameMatcher = new KhlProtocolPlayerNameMatcher()) {
    Object.assign(this, { players, nameMatcher, teamNormalizer: new KhlProtocolTeamNameNormalizer(league) });
  }

  findPlayer(row) {
    const teamPlayers = this.players.filter((player) => this.#sameTeam(player.team, row.team));
    return this.#findPlayerByName(teamPlayers, row) || this.#findTrustedPlayerByNumber(teamPlayers, row);
  }

  #findPlayerByName(teamPlayers, row) {
    return teamPlayers.find((player) => this.nameMatcher.isSamePlayer(player, row.name)) || null;
  }

  #findTrustedPlayerByNumber(teamPlayers, row) {
    return teamPlayers.find((player) => this.nameMatcher.canTrustNumber(player, row)) || null;
  }

  #sameTeam(playerTeam, rowTeam) {
    return this.#normalizeName(playerTeam) === this.#normalizeName(this.teamNormalizer.normalizeTeamName(rowTeam));
  }

  #normalizeName(value) {
    return String(value || "").toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();
  }
}
