export class AdminPlayerMutationService {
  constructor({ view, playerCatalogRepository }) {
    Object.assign(this, { view, playerCatalogRepository });
  }

  async updatePlayerPrice(chatId, playerId, price) {
    if (!Number.isInteger(price) || price < 0) return this.view.renderInvalidCommand(chatId);
    const player = await this.playerCatalogRepository.updatePlayerPrice(playerId, price);
    return this.view.renderOperationResult(chatId, player, "Цена обновлена");
  }

  async updatePlayerTeam(chatId, playerId, team) {
    if (!team) return this.view.renderInvalidCommand(chatId);
    const player = await this.playerCatalogRepository.updatePlayerTeam(playerId, team);
    return this.view.renderOperationResult(chatId, player, "Команда обновлена");
  }
}
