export class AdminVhlOnlineRouteHandler {
  constructor({ view, matchCatalog, registrationService, stateStore, fallbackView }) {
    Object.assign(this, { view, matchCatalog, registrationService, stateStore, fallbackView });
  }

  async executeRoute(source) {
    if (source.route.type === "vhl_online") return this.view.renderMatchList(source.chatId, await this.matchCatalog.listManagedMatches());
    if (source.route.type === "vhl_online_match") return this.#requestProtocolId(source.chatId, source.route.playerId);
    return null;
  }

  handlePendingInput(source) {
    return source.pending.type === "vhl_online_protocol" ? this.registrationService.registerOnlineProtocol(source) : null;
  }

  async #requestProtocolId(chatId, matchId) {
    const match = await this.matchCatalog.findMatchById(matchId);
    if (!match) return this.fallbackView.renderNotFound(chatId);
    this.stateStore.waitForVhlOnlineProtocolId(chatId, matchId);
    return this.view.renderProtocolIdPrompt(chatId, match);
  }
}
