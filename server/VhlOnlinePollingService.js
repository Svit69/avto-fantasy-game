import { VhlOnlineDataProvider } from "./VhlOnlineDataProvider.js";
import { VhlReportDataProvider } from "./VhlReportDataProvider.js";

export class VhlOnlinePollingService {
  constructor({ calendarRepository, khlServiceFactory, selector, logger, adminNotifier = null }) {
    Object.assign(this, { calendarRepository, khlServiceFactory, selector, logger, adminNotifier });
  }

  async pollActiveMatches() {
    const calendar = await this.calendarRepository.listCalendar();
    const matches = this.selector.findActiveMatches(calendar);
    const results = [];
    for (const match of matches) results.push(await this.#ingestMatch(match));
    this.logger.info("vhl_online_poll_finished", { matches: results.length });
    return results;
  }

  async #ingestMatch(match) {
    const players = await this.khlServiceFactory.createPlayerCatalogRepository().listPlayers();
    await this.adminNotifier?.notifyMatchStarted(match);
    const provider = this.#createDataProvider(match, players);
    const result = await this.khlServiceFactory.createIngestionService(provider).ingestMatch(match.tourId, match.onlineGameId);
    await this.adminNotifier?.notifyInterimResultCollected(match, result);
    await this.adminNotifier?.notifyFinalDataCollected(match, result);
    this.logger.info("vhl_online_match_ingested", { matchId: match.id, onlineGameId: match.onlineGameId, ok: result.ok });
    return result;
  }

  #createDataProvider(match, players) {
    const identity = { tournamentId: match.tourId, scheduledAt: match.startsAt };
    if (match.isLivePollingWindow) return new VhlOnlineDataProvider({ onlineGameId: match.onlineGameId, players, identity });
    return new VhlReportDataProvider({ source: this.#createReportSource(match.onlineGameId), players, identity });
  }

  #createReportSource(onlineGameId) {
    return { type: "report", gameId: onlineGameId, url: `https://vhlru.ru/report/1430/?idgame=${onlineGameId}` };
  }
}
