import { KhlProtocolPdfDataProvider } from "./KhlProtocolPdfDataProvider.js";
import { TelegramDocumentFileDownloader } from "./TelegramDocumentFileDownloader.js";
import { AdminVhlOnlineProtocolImporter } from "./AdminVhlOnlineProtocolImporter.js";
import { ProtocolImportIdentityFactory } from "./ProtocolImportIdentityFactory.js";
export class AdminProtocolImportService {
  constructor({ botClient, khlServiceFactory, protocolView, logger, stateStore, calendarRepository }) {
    Object.assign(this, { botClient, khlServiceFactory, protocolView, logger, stateStore, downloader: new TelegramDocumentFileDownloader(botClient),
      identityFactory: new ProtocolImportIdentityFactory(),
      vhlImporter: new AdminVhlOnlineProtocolImporter({ khlServiceFactory, protocolView, logger, stateStore, calendarRepository }) });
  }
  async importProtocolDocument(source) {
    if (source.pending.league === "ВХЛ") return this.vhlImporter.importProtocol(source);
    if (!this.#isPdf(source.document)) return this.#renderInvalidFileAndKeepWaiting(source);
    try {
      const pdfBuffer = await this.downloader.downloadDocument(source.document);
      const result = await this.#ingestProtocol(source, pdfBuffer);
      return this.protocolView.renderImportResult(source.chatId, result);
    } catch (error) {
      this.logger.warn("admin_protocol_import_failed", { chatId: source.chatId, errorMessage: error.message });
      return this.protocolView.renderImportFailed(source.chatId);
    }
  }
  async #ingestProtocol(source, pdfBuffer) {
    const playerCatalogRepository = this.khlServiceFactory.createPlayerCatalogRepository();
    const players = await playerCatalogRepository.listPlayers();
    const identity = this.identityFactory.createIdentity(source, pdfBuffer);
    const provider = new KhlProtocolPdfDataProvider({ pdfBuffer, identity, players });
    const result = await this.khlServiceFactory.createIngestionService(provider).ingestMatch(identity.tournamentId, identity.gameId);
    return this.#enrichPlayerStats(result, players);
  }
  #renderInvalidFileAndKeepWaiting(source) { this.stateStore.waitForProtocol(source.chatId, source.pending.league); return this.protocolView.renderInvalidFile(source.chatId); }
  #enrichPlayerStats(result, players) {
    const names = new Map(players.map((player) => [player.id, `${player.lastName} ${player.firstName}`]));
    return { ...result, playerStats: result.playerStats.map((stat) => ({ ...stat, playerName: names.get(stat.playerId) || stat.playerId })) };
  }
  #isPdf(document) { return document?.mime_type === "application/pdf" || document?.file_name?.toLowerCase().endsWith(".pdf"); }
}
