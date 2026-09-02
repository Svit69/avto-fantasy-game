export class VhlOnlineProtocolIdResolver {
  constructor(rawMapping = process.env.VHL_ONLINE_MATCH_IDS || "") {
    this.mapping = this.#parseMapping(rawMapping);
  }

  resolveOnlineGameId(match) {
    return match.onlineProtocolId || this.mapping[match.id] || this.mapping[match.gameId] || "";
  }

  #parseMapping(rawMapping) {
    return String(rawMapping || "").split(",").reduce((mapping, item) => {
      const [matchId, onlineGameId] = item.split("=").map((part) => part?.trim());
      return matchId && onlineGameId ? { ...mapping, [matchId]: onlineGameId } : mapping;
    }, {});
  }
}
