import { KhlProtocolTeamNameNormalizer } from "./KhlProtocolTeamNameNormalizer.js";

export class KhlProtocolPlayerMatcher {
  constructor(players, league) { Object.assign(this, { players, teamNormalizer: new KhlProtocolTeamNameNormalizer(league) }); }

  findPlayer(row) {
    return this.players.find((player) => {
      return String(player.number || "") === String(row.number) && this.#sameTeam(player.team, row.team);
    }) || this.#findPlayerByName(row);
  }

  #findPlayerByName(row) {
    const rowName = this.#normalizeName(row.name);
    return this.players.find((player) => {
      const playerName = this.#normalizeName(`${player.lastName} ${player.firstName}`);
      return this.#isSamePlayerName(playerName, rowName) && this.#sameTeam(player.team, row.team);
    }) || null;
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
