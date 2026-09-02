import { VhlOnlineDataProvider } from "./VhlOnlineDataProvider.js";

export class VhlOnlinePollingService {
  constructor({ calendarRepository, khlServiceFactory, selector, logger }) {
    Object.assign(this, { calendarRepository, khlServiceFactory, selector, logger });
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
    const provider = new VhlOnlineDataProvider({ onlineGameId: match.onlineGameId, players, identity: { tournamentId: match.tourId } });
    const result = await this.khlServiceFactory.createIngestionService(provider).ingestMatch(match.tourId, match.onlineGameId);
    this.logger.info("vhl_online_match_ingested", { matchId: match.id, onlineGameId: match.onlineGameId, ok: result.ok });
    return result;
  }
}
