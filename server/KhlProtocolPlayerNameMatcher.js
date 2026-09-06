export class KhlProtocolPlayerNameMatcher {
  isSamePlayer(player, rowName) {
    const playerName = this.normalizeName(`${player.lastName} ${player.firstName}`);
    const protocolName = this.normalizeName(rowName);
    return Boolean(protocolName) && this.#isCompatibleName(playerName, protocolName, player);
  }

  canTrustNumber(player, row) {
    if (String(player.number || "") !== String(row.number || "")) return false;
    const rowName = this.normalizeName(row.name);
    return !rowName || this.isSamePlayer(player, row.name);
  }

  normalizeName(value) {
    return String(value || "").toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();
  }

  #isCompatibleName(playerName, protocolName, player) {
    return playerName === protocolName || protocolName.startsWith(`${playerName} `)
      || this.#hasLastNameAndInitial(player, protocolName);
  }

  #hasLastNameAndInitial(player, protocolName) {
    const lastName = this.normalizeName(player.lastName);
    const initial = this.normalizeName(player.firstName).charAt(0);
    const suffix = protocolName.startsWith(lastName) ? protocolName.slice(lastName.length).trim() : "";
    return Boolean(suffix) && (!initial || suffix.startsWith(initial));
  }
}
