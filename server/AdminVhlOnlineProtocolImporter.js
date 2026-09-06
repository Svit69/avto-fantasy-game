import { VhlOnlineDataProvider } from "./VhlOnlineDataProvider.js";
import { VhlProtocolSourceResolver } from "./VhlProtocolSourceResolver.js";
import { VhlReportDataProvider } from "./VhlReportDataProvider.js";
import { VhlOnlineCalendarMatchResolver } from "./VhlOnlineCalendarMatchResolver.js";

export class AdminVhlOnlineProtocolImporter {
  constructor({ khlServiceFactory, protocolView, logger, stateStore, calendarRepository }) {
    Object.assign(this, { khlServiceFactory, protocolView, logger, stateStore,
      calendarResolver: new VhlOnlineCalendarMatchResolver(calendarRepository) });
  }

  async importProtocol(source) {
    try {
      const protocolSource = new VhlProtocolSourceResolver().resolveSource(source.text);
      if (!protocolSource) return this.#renderInvalidInputAndKeepWaiting(source);
      const result = await this.#ingestProtocol(protocolSource);
      if (!result.ok) return this.protocolView.renderImportRejected(source.chatId, result);
      return this.protocolView.renderImportResult(source.chatId, result);
    } catch (error) {
      this.logger.warn("admin_vhl_import_failed", { chatId: source.chatId, errorMessage: error.message });
      return this.protocolView.renderImportFailed(source.chatId);
    }
  }

  async #ingestProtocol(protocolSource) {
    const playerCatalogRepository = this.khlServiceFactory.createPlayerCatalogRepository();
    const [players, calendarMatch] = await Promise.all([playerCatalogRepository.listPlayers(), this.calendarResolver.findMatchByOnlineGameId(protocolSource.gameId)]);
    const identity = this.calendarResolver.createProviderIdentity(calendarMatch, protocolSource.gameId);
    const provider = this.#createProvider(protocolSource, players, identity);
    const result = await this.khlServiceFactory.createIngestionService(provider).ingestMatch(identity.tournamentId || "vhl-online", protocolSource.gameId);
    return this.#enrichPlayerStats(result, players);
  }

  #createProvider(protocolSource, players, identity) {
    if (protocolSource.type === "report") return new VhlReportDataProvider({ source: protocolSource, players, identity });
    return new VhlOnlineDataProvider({ onlineGameId: protocolSource.gameId, players, identity });
  }

  #enrichPlayerStats(result, players) {
    const names = new Map(players.map((player) => [player.id, `${player.lastName} ${player.firstName}`]));
    return { ...result, playerStats: (result.playerStats || []).map((stat) => ({ ...stat, playerName: names.get(stat.playerId) || stat.playerId })) };
  }

  #renderInvalidInputAndKeepWaiting(source) {
    this.stateStore.waitForProtocol(source.chatId, "ВХЛ");
    return this.protocolView.renderInvalidFile(source.chatId);
  }
}
