import { KhlProtocolTeamNameNormalizer } from "./KhlProtocolTeamNameNormalizer.js";

export class KhlProtocolPlayerMatcher {
  constructor(players, league) { Object.assign(this, { players, teamNormalizer: new KhlProtocolTeamNameNormalizer(league) }); }

  findPlayer(row) {
    return this.#findPlayerByName(row) || this.#findPlayerByNumberWhenNameIsMissing(row);
  }

  #findPlayerByName(row) {
    const rowName = this.#normalizeName(row.name);
    return this.players.find((player) => {
      const playerName = this.#normalizeName(`${player.lastName} ${player.firstName}`);
      return this.#isSamePlayerName(playerName, rowName) && this.#sameTeam(player.team, row.team);
    }) || null;
  }

  #findPlayerByNumberWhenNameIsMissing(row) {
    if (this.#normalizeName(row.name)) return null;
    return this.players.find((player) => this.#hasSameNumber(player, row) && this.#sameTeam(player.team, row.team)) || null;
  }

  #hasSameNumber(player, row) {
    return String(player.number || "") === String(row.number || "");
  }

  #isSamePlayerName(playerName, rowName) {
    return playerName === rowName || rowName.startsWith(`${playerName} `);
  }

  #sameTeam(playerTeam, rowTeam) {
    return this.#normalizeName(playerTeam) === this.#normalizeName(this.teamNormalizer.normalizeTeamName(rowTeam));
  }

  #normalizeName(value) {
    return String(value || "").toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();
  }
}
