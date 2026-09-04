import { KhlProtocolPdfDataProvider } from "./KhlProtocolPdfDataProvider.js";
import { TelegramDocumentFileDownloader } from "./TelegramDocumentFileDownloader.js";
import { AdminVhlOnlineProtocolImporter } from "./AdminVhlOnlineProtocolImporter.js";
export class AdminProtocolImportService {
  constructor({ botClient, khlServiceFactory, protocolView, logger, stateStore, calendarRepository }) {
    Object.assign(this, { botClient, khlServiceFactory, protocolView, logger, stateStore, downloader: new TelegramDocumentFileDownloader(botClient),
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
    const identity = this.#createMatchIdentity(source);
    const provider = new KhlProtocolPdfDataProvider({ pdfBuffer, identity, players });
    const result = await this.khlServiceFactory.createIngestionService(provider).ingestMatch(identity.tournamentId, identity.gameId);
    return this.#enrichPlayerStats(result, players);
  }
  #createMatchIdentity(source) {
    return { tournamentId: this.#resolveTournamentId(source), gameId: this.#resolveGameId(source),
      league: source.pending.league, status: "finished", ...this.#resolveTeamId(source.pending.league) };
  }
  #resolveTournamentId(source) {
    return this.#matchValue(source.caption, /tournamentId[:=\s]+(\d+)/i) || process.env.KHL_DEFAULT_TOURNAMENT_ID || "1369";
  }
  #resolveGameId(source) {
    return this.#matchValue(`${source.document.file_name} ${source.caption}`, /(?:game-|gameId[:=\s]+)(\d+)/i) || `telegram-${source.document.file_unique_id}`;
  }
  #resolveTeamId(league) { return league === "КХЛ" ? { homeTeamId: "190" } : {}; }
  #renderInvalidFileAndKeepWaiting(source) { this.stateStore.waitForProtocol(source.chatId, source.pending.league); return this.protocolView.renderInvalidFile(source.chatId); }
  #enrichPlayerStats(result, players) {
    const names = new Map(players.map((player) => [player.id, `${player.lastName} ${player.firstName}`]));
    return { ...result, playerStats: result.playerStats.map((stat) => ({ ...stat, playerName: names.get(stat.playerId) || stat.playerId })) };
  }
  #isPdf(document) { return document?.mime_type === "application/pdf" || document?.file_name?.toLowerCase().endsWith(".pdf"); }
  #matchValue(value, pattern) { return String(value || "").match(pattern)?.[1] || null; }
}
