import { VhlOnlineDataProvider } from "./VhlOnlineDataProvider.js";
import { VhlOnlineUrlResolver } from "./VhlOnlineUrlResolver.js";

export class AdminVhlOnlineProtocolImporter {
  constructor({ khlServiceFactory, protocolView, logger, stateStore }) {
    Object.assign(this, { khlServiceFactory, protocolView, logger, stateStore });
  }

  async importProtocol(source) {
    try {
      const onlineGameId = new VhlOnlineUrlResolver().resolveGameId(source.text);
      if (!onlineGameId) return this.#renderInvalidInputAndKeepWaiting(source);
      const result = await this.#ingestOnlineProtocol(onlineGameId);
      return this.protocolView.renderImportResult(source.chatId, result);
    } catch (error) {
      this.logger.warn("admin_vhl_import_failed", { chatId: source.chatId, errorMessage: error.message });
      return this.protocolView.renderImportFailed(source.chatId);
    }
  }

  async #ingestOnlineProtocol(onlineGameId) {
    const playerCatalogRepository = this.khlServiceFactory.createPlayerCatalogRepository();
    const players = await playerCatalogRepository.listPlayers();
    const provider = new VhlOnlineDataProvider({ onlineGameId, players });
    const result = await this.khlServiceFactory.createIngestionService(provider).ingestMatch("vhl-online", onlineGameId);
    return this.#enrichPlayerStats(result, players);
  }

  #enrichPlayerStats(result, players) {
    const names = new Map(players.map((player) => [player.id, `${player.lastName} ${player.firstName}`]));
    return { ...result, playerStats: result.playerStats.map((stat) => ({ ...stat, playerName: names.get(stat.playerId) || stat.playerId })) };
  }

  #renderInvalidInputAndKeepWaiting(source) {
    this.stateStore.waitForProtocol(source.chatId, "ВХЛ");
    return this.protocolView.renderInvalidFile(source.chatId);
  }
}
