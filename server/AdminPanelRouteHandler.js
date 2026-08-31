export class AdminPanelRouteHandler {
  constructor({ view, stateStore, userRepository, playerCatalogRepository, mutationService }) {
    Object.assign(this, { view, stateStore, userRepository, playerCatalogRepository, mutationService });
  }

  async executeRoute(source) {
    const route = source.route;
    if (route.type === "menu") return this.view.renderMenu(source.chatId);
    if (route.type === "users") return this.view.renderUsers(source.chatId, await this.userRepository.listUsers());
    if (route.type === "players") return this.view.renderPlayers(source.chatId, await this.playerCatalogRepository.listPlayers(), route.page || 0);
    if (route.type === "player") return this.view.renderPlayer(source.chatId, await this.playerCatalogRepository.findPlayerById(route.playerId));
    if (route.type === "price") return this.#requestPriceInput(source.chatId, route.playerId);
    if (route.type === "team") return this.#requestTeamInput(source.chatId, route.playerId);
    if (route.type === "custom_team") return this.#requestCustomTeamInput(source.chatId, route.playerId);
    if (route.type === "set_team") return this.mutationService.updatePlayerTeam(source.chatId, route.playerId, this.#resolveTeamName(route.value));
    return null;
  }

  renderAccessDenied(chatId) {
    return this.view.renderAccessDenied(chatId);
  }

  async handlePendingInput(source) {
    if (source.pending.type === "price") return this.mutationService.updatePlayerPrice(source.chatId, source.pending.playerId, Number(source.text));
    if (source.pending.type === "team") return this.mutationService.updatePlayerTeam(source.chatId, source.pending.playerId, source.text.trim());
    return null;
  }

  async #requestPriceInput(chatId, playerId) {
    const player = await this.playerCatalogRepository.findPlayerById(playerId);
    if (!player) return this.view.renderNotFound(chatId);
    this.stateStore.waitForPrice(chatId, playerId); return this.view.renderPricePrompt(chatId, player);
  }

  async #requestTeamInput(chatId, playerId) {
    const player = await this.playerCatalogRepository.findPlayerById(playerId);
    return player ? this.view.renderTeamPrompt(chatId, player) : this.view.renderNotFound(chatId);
  }

  async #requestCustomTeamInput(chatId, playerId) {
    const player = await this.playerCatalogRepository.findPlayerById(playerId);
    if (!player) return this.view.renderNotFound(chatId);
    this.stateStore.waitForTeam(chatId, playerId); return this.view.renderTeamPrompt(chatId, player);
  }

  #resolveTeamName(teamCode) {
    return { avto: "Автомобилист", gornyak: "Горняк-УГМК" }[teamCode] || teamCode;
  }
}
