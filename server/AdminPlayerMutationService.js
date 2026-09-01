export class AdminPlayerMutationService {
  constructor({ view, playerCatalogRepository, rosterChangeNotifications = null }) {
    Object.assign(this, { view, playerCatalogRepository, rosterChangeNotifications });
  }

  async updatePlayerPrice(chatId, playerId, price) {
    if (!Number.isInteger(price) || price < 0) return this.view.renderInvalidCommand(chatId);
    const player = await this.playerCatalogRepository.updatePlayerPrice(playerId, price);
    return this.view.renderOperationResult(chatId, player, "Цена обновлена");
  }

  async updatePlayerTeam(chatId, playerId, team) {
    if (!team) return this.view.renderInvalidCommand(chatId);
    const previousPlayer = await this.playerCatalogRepository.findPlayerById(playerId);
    const player = await this.playerCatalogRepository.updatePlayerTeam(playerId, team);
    await this.rosterChangeNotifications?.notifyPlayerTeamChanged(player, previousPlayer?.team, player?.team);
    return this.view.renderOperationResult(chatId, player, "Команда обновлена");
  }

  async markPlayerLeftGame(chatId, playerId) {
    const player = await this.playerCatalogRepository.markPlayerLeftGame(playerId);
    await this.rosterChangeNotifications?.notifyPlayerLeftGame(player);
    return this.view.renderOperationResult(chatId, player, "Игрок убран из игры");
  }
}
