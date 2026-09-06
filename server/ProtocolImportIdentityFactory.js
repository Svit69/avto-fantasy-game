import crypto from "node:crypto";

export class ProtocolImportIdentityFactory {
  createIdentity(source, protocolBuffer = null) {
    const sourceHash = this.#createProtocolHash(protocolBuffer);
    return { tournamentId: this.#resolveTournamentId(source), gameId: this.#resolveGameId(source, sourceHash),
      league: source.pending.league, status: "finished", sourceHash, ...this.#resolveTeamId(source.pending.league) };
  }

  #resolveTournamentId(source) {
    return this.#matchValue(source.caption, /tournamentId[:=\s]+(\d+)/i) || process.env.KHL_DEFAULT_TOURNAMENT_ID || "1369";
  }

  #resolveGameId(source, sourceHash) {
    return this.#matchValue(`${source.document.file_name} ${source.caption}`, /(?:game-|gameId[:=\s]+)(\d+)/i)
      || (sourceHash ? `pdf-${sourceHash.slice(0, 20)}` : `telegram-${source.document.file_unique_id}`);
  }

  #resolveTeamId(league) { return league === "КХЛ" ? { homeTeamId: "190" } : {}; }
  #createProtocolHash(buffer) { return buffer ? crypto.createHash("sha256").update(buffer).digest("hex") : ""; }
  #matchValue(value, pattern) { return String(value || "").match(pattern)?.[1] || null; }
}
