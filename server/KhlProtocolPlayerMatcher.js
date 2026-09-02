export class KhlProtocolPlayerMatcher {
  constructor(players) { this.players = players; }

  findPlayer(row) {
    return this.players.find((player) => {
      return String(player.number || "") === String(row.number) && this.#sameTeam(player.team, row.team);
    }) || this.#findPlayerByName(row);
  }

  #findPlayerByName(row) {
    const rowName = this.#normalizeName(row.name);
    return this.players.find((player) => {
      const playerName = this.#normalizeName(`${player.lastName} ${player.firstName}`);
      return playerName === rowName && this.#sameTeam(player.team, row.team);
    }) || null;
  }

  #sameTeam(playerTeam, rowTeam) {
    return this.#normalizeName(playerTeam) === this.#normalizeName(rowTeam);
  }

  #normalizeName(value) {
    return String(value || "").toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();
  }
}
