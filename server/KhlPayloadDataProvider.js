export class KhlPayloadDataProvider {
  constructor(payload) { this.payload = payload; }
  async getMatch(tournamentId, gameId) { return this.payload.match || { tournamentId, gameId }; }
  async getPlayByPlay() { return this.payload.events || []; }
  async getProtocol() { return this.payload.protocol || {}; }
  async getLineups() { return this.payload.lineups || {}; }
}
