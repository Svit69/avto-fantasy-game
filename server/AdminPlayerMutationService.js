import { ApplicationDataRevision } from "./ApplicationDataRevision.js";
import { RosterPricingCoordinator } from "./RosterPricingCoordinator.js";
export class AdminPlayerMutationService {
  constructor({ view, playerCatalogRepository, rosterChangeNotifications = null, rosterPriceService = null }) {
    Object.assign(this, { view, playerCatalogRepository, rosterChangeNotifications, rosterPriceService });
  }

  async updatePlayerPrice(chatId, playerId, price) {
    if (!Number.isInteger(price) || price < 0) return this.view.renderInvalidCommand(chatId);
    return new RosterPricingCoordinator().runExclusive(() => this.#updatePlayerPrice(chatId, playerId, price));
  }
  async #updatePlayerPrice(chatId, playerId, price) {
    const player = await this.playerCatalogRepository.updatePlayerPrice(playerId, price);
    await new ApplicationDataRevision().invalidateReports();
    if (player) await this.rosterPriceService?.reconcileOpenRosters();
    return this.view.renderOperationResult(chatId, player, "Цена обновлена");
  }

  async updatePlayerTeam(chatId, playerId, team) {
    if (!team) return this.view.renderInvalidCommand(chatId);
    const previousPlayer = await this.playerCatalogRepository.findPlayerById(playerId);
    const player = await this.playerCatalogRepository.updatePlayerTeam(playerId, team);
    await new ApplicationDataRevision().invalidateReports();
    await this.rosterChangeNotifications?.notifyPlayerTeamChanged(player, previousPlayer?.team, player?.team);
    return this.view.renderOperationResult(chatId, player, "Команда обновлена");
  }

  async markPlayerLeftGame(chatId, playerId) {
    const player = await this.playerCatalogRepository.markPlayerLeftGame(playerId);
    await new ApplicationDataRevision().invalidateReports();
    await this.rosterChangeNotifications?.notifyPlayerLeftGame(player);
    return this.view.renderOperationResult(chatId, player, "Игрок убран из игры");
  }
}
