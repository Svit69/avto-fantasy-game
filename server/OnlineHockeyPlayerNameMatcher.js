export class OnlineHockeyPlayerNameMatcher {
  isSamePlayer(player, sourceName) {
    const source = this.#normalize(sourceName);
    const full = this.#normalize(`${player.lastName} ${player.firstName}`);
    if (source === full || source.startsWith(`${full} `)) return true;
    const lastName = this.#normalize(player.lastName); const initial = this.#normalize(player.firstName).charAt(0);
    return Boolean(initial) && [initial, `${initial}.`].some((suffix) => source === `${lastName} ${suffix}`);
  }
  #normalize(value) { return String(value || "").normalize("NFC").toLowerCase().replace(/ё/g, "е").replace(/\u0301/g, "").replace(/\s+/g, " ").trim(); }
}
