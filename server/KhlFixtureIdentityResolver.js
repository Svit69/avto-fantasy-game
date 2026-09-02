export class KhlFixtureIdentityResolver {
  resolvePayloadIdentity(payload, fallbackPath = "") {
    const match = payload.match || payload;
    const tournamentId = match.tournamentId || match.tournament_id || this.#matchPathNumber(fallbackPath, 0);
    const gameId = match.gameId || match.game_id || this.#matchPathNumber(fallbackPath, 1);
    if (!tournamentId || !gameId) throw new Error("khl_fixture_identity_missing");
    return { tournamentId: String(tournamentId), gameId: String(gameId) };
  }

  #matchPathNumber(filePath, index) {
    return (filePath.match(/(\d+)[-_](\d+)/) || [])[index + 1] || null;
  }
}
